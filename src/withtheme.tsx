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

type Decorator<TProps> = (target: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => React.ComponentClass<TProps>;

export interface ThemeAttributes<TTheme> {
  theme?: TTheme;
}

export function removeThemeAttributes(attributes: ThemeAttributes<any>): void {
  delete attributes.theme;
}

function mergeTheme(a: any, b: any): any {
  const theme = objectAssign({}, a);
  const customTheme = objectAssign({}, b);
  delete customTheme.classes;
  deepExtend(theme, customTheme);

  // classes get appended instead of overwritten.
  const classes: { [className: string]: string } = b.classes;
  if (classes) {
    for (const key in classes) {
      if (theme.classes[key] === undefined) {
        theme.classes[key] = classes[key];
        continue;
      }
      theme.classes[key] += " " + classes[key];
    }
  }
  return theme;
}

export function withTheme<TProps extends ThemeAttributes<any>>(themeFactory: ThemeFactory<any, any>): Decorator<TProps> {
  return (TargetComponent: React.ComponentClass<TProps>) => {
    const enhanced = class WithTheme extends React.PureComponent<TProps, void> {
      public static contextTypes: any = ThemeContextProvider.childContextTypes;

      public context: ThemeContext<any>;
      private theme: any;
      private computedTheme: any;

      constructor(props: TProps) {
        super(props);
      }

      public componentWillMount(): void {
        const vars = this.context.themeVars;
        const { jss } = this.context;
        if (!jss) {
          return;
        }
        const customTheme = this.props.theme;
        const theme = themeFactory(vars, jss);
        this.theme = theme;
        this.computedTheme = customTheme ? mergeTheme(theme, customTheme) : theme;
      }

      public componentWillReceiveProps(nextProps: TProps): void {
        if (this.props.theme !== nextProps.theme) {
          const customTheme = nextProps.theme;
          this.computedTheme = customTheme ? mergeTheme(this.theme, customTheme) : this.theme;
        }
      }

      public render(): React.ReactElement<any> {
        return <TargetComponent {...this.props} theme={this.computedTheme} />;
      }
    };

    // Export impure version, except for testing.
    if (process.env.NODE_ENV !== "test") {
      (enhanced.prototype as any).shouldComponentUpdate = () => true;
    }
    return enhanced;
  };
}
