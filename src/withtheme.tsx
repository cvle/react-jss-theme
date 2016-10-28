/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import * as objectAssign from "object-assign";
import * as deepExtend from "deep-extend";
import { ThemeFactory } from "./themefactory";
import { ThemeContext, ThemeContextProvider } from "./themecontextprovider";

export interface ThemeAttributes<TTheme> {
  theme?: TTheme;
}

export function removeThemeAttributes(attributes: ThemeAttributes<any>): void {
  delete attributes.theme;
}

export function withTheme<TProps extends ThemeAttributes<any>>(themeFactory: ThemeFactory<any, any>):
  (target: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => React.ComponentClass<TProps> {
  return (TargetComponent: React.ComponentClass<TProps>) => {
    return class WithTheme extends React.PureComponent<TProps, void> {
      public static contextTypes: any = ThemeContextProvider.childContextTypes;

      public context: ThemeContext<any>;

      private theme: any;

      constructor(props: TProps) {
        super(props);
      }

      public componentWillMount(): void {
        const vars = this.context.themeVars;
        const { jss } = this.context;
        if (!jss) {
          return;
        }
        const theme = themeFactory(vars, jss);
        this.theme = theme;
      }

      public render(): React.ReactElement<any> {
        const props: TProps = objectAssign({}, this.props);
        props.theme = this.getTheme();
        return <TargetComponent {...props} />;
      }

      private getTheme(): any {
        const theme = objectAssign({}, this.theme);
        if (this.props.theme) {
          const customTheme = objectAssign({}, this.props.theme);
          delete customTheme.classes;
          deepExtend(theme, customTheme);

          // classes get appended instead of overwritten.
          const classes: { [className: string]: string } = this.props.theme.classes;
          if (classes) {
            for (const key in classes) {
              if (theme.classes[key] === undefined) {
                theme.classes[key] = classes[key];
                continue;
              }
              theme.classes[key] += " " + classes[key];
            }
          }
        }
        return theme;
      }
    };
  };
}
