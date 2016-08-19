declare module "jss" {
  export type RuleType = { [rule: string]: any } | Object;
  export type RulesType = { [name: string]: RuleType } | Object;
  export type Plugin = (rules: RulesType) => void;

  export interface StyleSheetOptions {
    media?: string;
    meta?: string;
    named?: boolean;
    link?: boolean;
    element?: HTMLStyleElement;
  }

  export interface SetupOptions {
    generateClassName?: (stylesStr: string, rule: Rule) => string;
    plugins?: Array<Plugin>;
  }

  export interface Rule {
    applyTo(element: HTMLElement): void;
    prop(name: string, value?: string): string;
    toJSON(): string;
  }

  export interface StyleSheet {
    classes: any;
    attach(): void;
    detach(): void;
    toString(): string;
    options: StyleSheetOptions;
    addRule(selector:string, rule: RuleType, options?: StyleSheetOptions): Rule;
    addRule(rule: RuleType, options?: StyleSheetOptions): Rule;
  }

  export interface Registry {
    registry:  Array<StyleSheet>;
    toString(): string;
  }

  export default class JSS {
    static create(options?: SetupOptions): JSS;
    static setup(options: SetupOptions): void;
    static use(...plugin: Array<Plugin>): void;
    static createStyleSheet(rules: RulesType, options?: StyleSheetOptions): StyleSheet;
    static createRule(selector: string, rule: RuleType): Rule;
    static createRule(rule: RuleType): Rule;
    static sheets: Registry;

    setup(options: SetupOptions): void;
    use(...plugin: Array<Plugin>): void;
    createStyleSheet(rules?: RulesType, options?: StyleSheetOptions): StyleSheet;
    createRule(selector: string, rule: RuleType): Rule;
    createRule(rule: RuleType): Rule;
    sheets: Registry;
  }
}

