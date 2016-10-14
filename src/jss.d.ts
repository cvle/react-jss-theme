/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

declare namespace JSS {
  type RuleDef = { [rule: string]: any };
  type RulesDef = { [name: string]: RuleDef };
  type Plugin = (rules: RulesDef) => void;

  interface StyleSheetOptions {
    media?: string;
    meta?: string;
    named?: boolean;
    link?: boolean;
    element?: HTMLStyleElement;
  }

  interface SetupOptions {
    generateClassName?: (stylesStr: string, rule: Rule) => string;
    plugins?: Array<Plugin>;
  }

  interface Rule {
    name: string;
    type: string;
    selectorText: string;
    className: string;
    style: string;
    originalStyle: string;
    options: {
      named?: boolean;
      className?: string;
      sheet?: StyleSheet;
    };
    applyTo(element: HTMLElement): void;
    prop(name: string, value?: string): string;
    toJSON(): string;
  }

  interface StyleSheet {
    classes: any;
    attach(): void;
    detach(): void;
    toString(): string;
    options: StyleSheetOptions;
    addRule(selector: string, rule: RuleDef, options?: StyleSheetOptions): Rule;
    addRule(rule: RuleDef, options?: StyleSheetOptions): Rule;
  }

  interface Registry {
    registry: Array<StyleSheet>;
    toString(): string;
  }

  interface JSS {
    setup(options: SetupOptions): void;
    use(...plugin: Array<Plugin>): void;
    createStyleSheet(rules?: RulesDef, options?: StyleSheetOptions): StyleSheet;
    createRule(selector: string, rule: RuleDef): Rule;
    createRule(rule: RuleDef): Rule;
    sheets: Registry;
  }
}

declare module "jss" {
  export function create(options?: JSS.SetupOptions): JSS.JSS;
  export default create();
}
