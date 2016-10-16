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
 * Theme is a collection of registered stylesheets.
 *
 * The stylesheets will be rendered according to the order they were
 * registered to the Theme, allowing indirect prioritizing of stylesheets.
 */
export class Theme<TConfig> {
  private styles: { [name: string]: JSS.StyleSheet; };
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
    this.styles[name] = sheet;
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

  public require(name: string): JSS.StyleSheet {
    const sheet = this.styles[name];
    if (!sheet) {
      return null;
    }
    if (!sheet.attached) {
      sheet.attach();
    }
    return sheet;
  }

  public attachGlobalStyles() {
    for (let name of this.globalStyles) {
      this.require(name);
    }
  }

  public detachAll() {
    for (let name in this.styles) {
      this.styles[name].detach;
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
