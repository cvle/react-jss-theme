/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import objectAssign = require("object-assign");

import { Theme } from "./theme";

export interface ThemeProviderContext<TThemeConfig> {
  theme: Theme<TThemeConfig>;
}

export interface ThemeOuterAttributes {
  styleName?: string;
}

export interface ThemeInnerAttributes<TThemeClasses> {
  themeClasses?: TThemeClasses;
}

export interface ThemeAttributes<TThemeClasses> extends
  ThemeOuterAttributes,
  ThemeInnerAttributes<TThemeClasses> { }

export function removeThemeAttributes(attributes: ThemeAttributes<any>) {
  delete attributes.themeClasses;
  delete attributes.styleName;
}

export function withTheme<TProps extends ThemeAttributes<any>>(defaultStyleNames = ""): (target: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => React.ComponentClass<TProps> {
  return (TargetComponent: React.ComponentClass<TProps>) => {
    return class WithTheme extends React.Component<TProps, void> {
      static contextTypes: any = {
        theme: React.PropTypes.object,
      };

      context: ThemeProviderContext<any>;

      private themeClasses: any;

      constructor(props: TProps) {
        super(props);
        this.themeClasses = {};
      }

      private toStyleNameArray(...styleName: Array<string>): Array<string> {
        const computed = new Array<string>();
        for (const name of styleName) {
          if (!name || !name.trim()) {
            continue;
          }
          const items = name.split(/\s+/);
          for (const i of items) {
            const trimed = i.trim();
            if (trimed && computed.indexOf(trimed) === -1) {
              computed.push(trimed);
            }
          }
        }
        return computed;
      }

      componentWillMount() {
        if (!this.context.theme) {
          return;
        }
        const styleNames = this.toStyleNameArray(defaultStyleNames, this.props["styleName"]);
        for (const styleName of styleNames) {

          const sheet = this.context.theme.require(styleName);
          if (!sheet) {
            console.error(`Stylesheet '${styleName}' was not found in template.`);
            return;
          }
          for (const className of Object.keys(sheet.classes)) {
            if (this.themeClasses[className] === undefined) {
              this.themeClasses[className] = sheet.classes[className];
              continue;
            }
            this.themeClasses[className] += " " + sheet.classes[className];
          }
        }
      }

      public render() {
        const styleName = this.toStyleNameArray(defaultStyleNames, this.props.styleName).join(" ");
        const props: TProps = objectAssign({}, this.props);
        if (this.themeClasses) {
          props.themeClasses = this.themeClasses;
        }
        props.styleName = styleName;
        return <TargetComponent {...props} />;
      }
    };
  };
}
