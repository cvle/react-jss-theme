/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import jss from "jss";

declare const process: { env: { NODE_ENV?: string } };

export type StylesMap = { [name: string]: JSS.RulesDef };
export type StylesCallback<TConfig> = (config: TConfig) => StylesMap;
export type Styles = StylesMap | StylesCallback<any>;

export interface ConstructThemeParams<TConfig> {
  jss?: JSS.JSS;
  styleConfig?: TConfig;
}

export interface RegisterOptions {
  global?: boolean;
}

/**
 * ManagedStyleSheet automatically mount/unmount Styles.
 */
class ManagedStyleSheet {
  private sheet: JSS.StyleSheet;
  private references: Array<Object>;

  constructor(sheet: JSS.StyleSheet) {
    this.sheet = sheet;
    this.references = [];
  }

  public get classes(): JSS.RulesDef {
    return this.sheet.classes;
  }

  public addReference(ref: Object) {
    if (this.references.indexOf(ref) !== -1) {
      console.error("StyleSheetReference was already added before.");
      return;
    }
    if (this.references.length === 0) {
      this.sheet.attach();
    }
    this.references.push(ref);
  };

  public removeReference(ref: Object) {
    if (this.references.indexOf(ref) === -1) {
      console.error("Unknown StyleSheetReference");
      return;
    }
    const idx = this.references.indexOf(ref);
    this.references.splice(idx, 1);
    if (this.references.length === 0) {
      this.sheet.detach();
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
    return this.managedSheet.classes;
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
export class Theme<TConfig> {
  private styles: { [name: string]: ManagedStyleSheet; };
  private globalStyles: Array<string>;
  private styleConfig: TConfig;
  private jss: JSS.JSS;

  constructor(params: ConstructThemeParams<TConfig> = {}) {
    this.styles = {};
    this.styleConfig = params.styleConfig;
    if (process && process.env.NODE_ENV !== "production") {
      this.styleConfig = Object.freeze(this.styleConfig);
    }
    this.jss = params.jss ? params.jss : jss;
    this.globalStyles = [];
  }

  public registerStyle(name: string, rules: JSS.RulesDef, opts: RegisterOptions = {}): void {
    const sheet = this.jss.createStyleSheet(rules, {
      meta: name,
      named: !opts.global,
      index: 1000 + Object.keys(this.styles).length,
    });
    this.styles[name] = new ManagedStyleSheet(sheet);
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
    let result = "";
    for (const sheet of this.jss.sheets.registry) {
      if (!sheet.attached) {
        continue;
      }
      result += sheet.toString() + "\n";
    }
    return result;
  }
}
