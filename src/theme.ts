/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as jss from "jss";
import JSSAPI from "jss";

/**
 * Renderer is an interface to a stylesheet renderer.
 */
interface Renderer {
  attach(sheet: ManagedStyleSheet<any>): void;
  detach(sheet: ManagedStyleSheet<any>): void;
}

/**
 * DOMRenderer renders stylesheets to the DOM using priority based rendering.
 */
class DOMRenderer {
  private map: { [priority:number]:HTMLStyleElement; };
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

  attach(managed: ManagedStyleSheet<any>) {
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

  detach(managed: ManagedStyleSheet<any>) {
    const priority = managed.getPriority();
    if (this.map[priority] === undefined) {
      throw new Error(`Detaching unavailable StyleSheet '${managed.getName()}'.`);
    }
    let element = this.map[priority];
    element.parentNode.removeChild(element);
    delete this.map[priority];
    const idx = this.sortedPriorities.indexOf(priority);
    delete this.sortedPriorities[idx];
  }
}

/**
 * ManagedStyleSheet takes care of reference counting and calling out to the renderer.
 * Additionally it associates a priority number with a styleSheet.
 */
class ManagedStyleSheet<T> {
  private sheet: jss.StyleSheet;
  private references: Array<StyleSheetReference<any>>;
  private priority: number;
  private renderer: Renderer;
  private name: string;

  constructor(name: string, rules: T, priority: number, renderer: Renderer) {
    this.sheet = JSSAPI.createStyleSheet(rules as any, { meta: name });
    this.references = [];
    this.priority = priority;
    this.renderer = renderer;
    this.name = name;
  }
  public getClasses(): T {
    return this.sheet.classes;
  }
  public getSheet(): jss.StyleSheet {
    return this.sheet;
  }
  public getPriority(): number {
    return this.priority;
  }
  public getName(): string {
    return this.name;
  }
  public addReference(ref: StyleSheetReference<any>) {
    this.references.indexOf
    if (this.references.indexOf(ref) != -1) {
      console.error("StyleSheetReference was already added before.");
      return;
    }
    if (this.references.length === 0) {
      this.renderer.attach(this);
    }
    this.references.push(ref);
  };
  public removeReference(ref: StyleSheetReference<any>) {
    if (this.references.indexOf(ref) == -1) {
      console.error("Unknown StyleSheetReference");
      return;
    }
    let idx = this.references.indexOf(ref);
    delete this.references[idx];
    if (this.references.length === 0) {
      this.renderer.detach(this);
    }
  };
}

/**
 * StyleSheetReference holds a reference to a stylesheet.
 */
export interface StyleSheetReference<T> {
  classes: T;
  release(): void;
}

class StyleSheetReferenceImpl<T> implements StyleSheetReference<T> {
  private managedSheet: ManagedStyleSheet<T>;

  constructor(managedSheet: ManagedStyleSheet<T>) {
    this.managedSheet = managedSheet;
    this.managedSheet.addReference(this);
  }

  public get classes(): T {
    return this.managedSheet.getClasses();
  }

  public release() {
    this.managedSheet.removeReference(this);
  };
}

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
export class Theme {
  private inUse: boolean;
  private styles: { [name:string]:ManagedStyleSheet<any>; };
  private renderer: Renderer;

  constructor(styles?: {[name: string]:jss.RulesType}) {
    this.styles = {};
    this.renderer = new DOMRenderer();
    this.inUse = false;
    if (styles) {
    this.registerStyles(styles);
    }
  }
  public registerStyle(name: string, rules: jss.RulesType): void {
    if (this.inUse) {
      throw new Error("called register on theme, but theme already in use.");
    }
    this.styles[name] = new ManagedStyleSheet(name, rules, Object.keys(this.styles).length, this.renderer);
  }
  public registerStyles(styles: {[name: string]:jss.RulesType}): void {
    for (let name in styles) {
      this.registerStyle(name, styles[name]);
    }
  }
  public require<T>(name: string): StyleSheetReference<T> {
    this.inUse = true;
    const sheet = this.styles[name];
    if (!sheet) {
      return null;
    }
    return new StyleSheetReferenceImpl<T>(sheet);
  }
}

export default Theme;
