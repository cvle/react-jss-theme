/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import jss from "jss";

interface Renderer {
  attach(sheet: ManagedStyleSheet): void;
  detach(sheet: ManagedStyleSheet): void;
  toString(): string;
}

class MemoryRenderer {
  private map: { [priority: number]: string; };
  private sortedPriorities: Array<number>;

  constructor() {
    this.map = {};
    this.sortedPriorities = new Array<number>();
  }

  attach(managed: ManagedStyleSheet) {
    const priority = managed.getPriority();
    if (this.map[priority] !== undefined) {
      throw new Error(`Attaching StyleSheet '${managed.getName()}' that is already rendered.`);
    }
    this.map[priority] = managed.getSheet().toString();
    this.sortedPriorities.push(priority);
    this.sortedPriorities = this.sortedPriorities.sort((n1, n2) => n1 - n2);
  }

  detach(managed: ManagedStyleSheet) {
    const priority = managed.getPriority();
    if (this.map[priority] === undefined) {
      throw new Error(`Detaching unavailable StyleSheet '${managed.getName()}'.`);
    }
    delete this.map[priority];
    const idx = this.sortedPriorities.indexOf(priority);
    this.sortedPriorities.splice(idx, 1);
  }

  toString(): string {
    let output = "";
    for (let priority of this.sortedPriorities) {
      output += this.map[priority] + "\n";
    }
    return output;
  }
}

/**
 * PriorityDOMRenderer renders stylesheets to the DOM using priority based rendering.
 */
class PriorityDOMRenderer {
  private map: { [priority: number]: HTMLStyleElement; };
  private sortedPriorities: Array<number>;
  private head: HTMLHeadElement;

  constructor() {
    this.map = {};
    this.sortedPriorities = new Array<number>();
    this.head = document.head || document.getElementsByTagName("head")[0];
  }

  private findNextElement(priority: number): HTMLStyleElement {
    for (let i of this.sortedPriorities) {
      if (priority < i) {
        return this.map[i];
      }
    }
    return null;
  }

  attach(managed: ManagedStyleSheet) {
    const priority = managed.getPriority();
    if (this.map[priority] !== undefined) {
      throw new Error(`Attaching StyleSheet '${managed.getName()}' that is already rendered.`);
    }
    let sheet = managed.getSheet();
    let next = this.findNextElement(managed.getPriority());
    let newElement = document.createElement("style");
    newElement.type = "text/css";
    newElement.textContent = `\n${sheet.toString()}\n`;
    if (sheet.options.media) newElement.setAttribute("media", sheet.options.media);
    newElement.setAttribute("data-meta", sheet.options.meta);

    if (next) {
      this.head.insertBefore(newElement, next);
    } else {
      this.head.appendChild(newElement);
    }

    this.map[priority] = newElement;
    this.sortedPriorities.push(priority);
    this.sortedPriorities = this.sortedPriorities.sort((n1, n2) => n1 - n2);
  }

  detach(managed: ManagedStyleSheet) {
    const priority = managed.getPriority();
    if (this.map[priority] === undefined) {
      throw new Error(`Detaching unavailable StyleSheet '${managed.getName()}'.`);
    }
    let element = this.map[priority];
    element.parentNode.removeChild(element);
    delete this.map[priority];
    const idx = this.sortedPriorities.indexOf(priority);
    this.sortedPriorities.splice(idx, 1);
  }

  toString(): string {
    let output = "";
    for (let priority of this.sortedPriorities) {
      output += this.map[priority].innerHTML + "\n";
    }
    return output;
  }
}

/**
 * ManagedStyleSheet takes care of reference counting and calling out to the renderer.
 * Additionally it associates a priority number with a styleSheet.
 */
class ManagedStyleSheet {
  private sheet: JSS.StyleSheet;
  private references: Array<Object>;
  private priority: number;
  private renderer: Renderer;
  private name: string;
  private jss: JSS.JSS;
  private named: boolean;

  constructor(name: string, rules: JSS.RulesDef, priority: number, named: boolean, jss: JSS.JSS, renderer: Renderer) {
    this.jss = jss;
    this.sheet = this.jss.createStyleSheet(rules as any, { meta: name, named: named });
    this.references = [];
    this.priority = priority;
    this.renderer = renderer;
    this.name = name;
  }
  public getClasses(): JSS.RulesDef {
    return this.sheet.classes;
  }
  public getSheet(): JSS.StyleSheet {
    return this.sheet;
  }
  public getPriority(): number {
    return this.priority;
  }
  public getName(): string {
    return this.name;
  }
  public addReference(ref: Object) {
    if (this.references.indexOf(ref) !== -1) {
      console.error("StyleSheetReference was already added before.");
      return;
    }
    if (this.references.length === 0) {
      this.renderer.attach(this);
    }
    this.references.push(ref);
  };
  public removeReference(ref: Object) {
    if (this.references.indexOf(ref) === -1) {
      console.error("Unknown StyleSheetReference");
      return;
    }
    let idx = this.references.indexOf(ref);
    this.references.splice(idx, 1);
    if (this.references.length === 0) {
      this.renderer.detach(this);
    }
  };
}

export interface StyleSheetReference {
  classes: JSS.RulesDef;
  release(): void;
}

class StyleSheetReferenceImpl implements StyleSheetReference {
  private managedSheet: ManagedStyleSheet;

  constructor(managedSheet: ManagedStyleSheet) {
    this.managedSheet = managedSheet;
    this.managedSheet.addReference(this);
  }

  public get classes(): JSS.RulesDef {
    return this.managedSheet.getClasses();
  }

  public release() {
    this.managedSheet.removeReference(this);
  };
}

export type StylesMap = { [name: string]: JSS.RulesDef };
export type StylesCallback<TConfig> = (config: TConfig) => StylesMap;
export type Styles = StylesMap | StylesCallback<any>;

export interface ConstructThemeParams<TConfig> {
  renderToDOM?: boolean;
  jss?: JSS.JSS;
  styleConfig?: TConfig;
}

export interface RegisterOptions {
  global?: boolean;
}

declare const process: any;

/**
 * Theme is a collection of registered stylesheets.
 *
 * A stylesheet can be required from the theme returning a stylesheetReference,
 * causing the stylesheet to be rendered to the DOM. Releasing all references to a stylesheet,
 * will remove the stylesheet from the DOM.
 *
 * The stylesheets will be rendered according to the order they were
 * registered to the Theme, allowing indirect prioritizing of stylesheets.
 */
export class Theme<TConfig> {
  private styles: { [name: string]: ManagedStyleSheet; };
  private globalStyles: Array<string>;
  private renderer: Renderer;
  private styleConfig: TConfig;
  private jss: JSS.JSS;

  constructor(params: ConstructThemeParams<TConfig> = {}) {
    this.styles = {};
    if (params.renderToDOM) {
      this.renderer = new PriorityDOMRenderer();
    } else {
      this.renderer = new MemoryRenderer();
    }
    this.styleConfig = params.styleConfig;
    if (process && process.env.NODE_ENV !== "production") {
      this.styleConfig = Object.freeze(this.styleConfig);
    }
    this.jss = params.jss ? params.jss : jss;
    this.globalStyles = [];
  }

  public registerStyle(name: string, rules: JSS.RulesDef, opts: RegisterOptions = {}): void {
    this.styles[name] = new ManagedStyleSheet(name, rules,
      Object.keys(this.styles).length, !opts.global,
      this.jss, this.renderer);
    if (opts.global) {
      this.globalStyles.push(name);
    }
  }

  public registerStyles(styles: Styles | Styles[], opts?: RegisterOptions): void {
    if (Array.isArray(styles)) {
      for (const style of styles) {
        this.registerStyles(style, opts);
      }
      return;
    }
    if (typeof styles === "function") {
      const cb = styles as StylesCallback<TConfig>;
      return this.registerStyles(cb(this.styleConfig), opts);
    }
    const stylesMap = styles as StylesMap;
    for (const name in stylesMap) {
      this.registerStyle(name, stylesMap[name], opts);
    }
  }
  public require(name: string): StyleSheetReference {
    const sheet = this.styles[name];
    if (!sheet) {
      return null;
    }
    return new StyleSheetReferenceImpl(sheet);
  }

  public mountGlobalStyles() {
    for (let name of this.globalStyles) {
      this.styles[name].addReference(this);
    }
  }
  public unmountGlobalStyles() {
    for (let name of this.globalStyles) {
      this.styles[name].removeReference(this);
    }
  }

  public toString(): string {
    return this.renderer.toString();
  }
}
