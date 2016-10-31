/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import jssPreset from "jss-preset-default";
import { create as createJSS } from "jss";

export interface ThemeContext<TThemeVars> {
  themeVars?: TThemeVars;
  jss?: JSS.JSS;
}

export interface ThemeContextProviderProps<TThemeVars> {
  themeVars?: TThemeVars;
  jss?: JSS.JSS;
}

export class GenericThemeContextProvider<TThemeVars> extends
  React.Component<ThemeContextProviderProps<TThemeVars>, {}> {
  public static childContextTypes: any = {
    themeVars: React.PropTypes.object,
    jss: React.PropTypes.object.isRequired,
  };

  private themeVars: TThemeVars;
  private jss: JSS.JSS;

  constructor(props: ThemeContextProviderProps<TThemeVars>) {
    super(props);
    this.themeVars = props.themeVars ? props.themeVars : null;
    this.jss = props.jss ? props.jss : createJSS(jssPreset());
  }

  public componentWillReceiveProps(nextProps: ThemeContextProviderProps<TThemeVars>): void {
    this.themeVars = nextProps.themeVars;
    this.jss = nextProps.jss;
  }

  public getChildContext(): ThemeContext<TThemeVars> {
    return {
      themeVars: this.themeVars,
      jss: this.jss,
    };
  }

  public render(): React.ReactElement<any> {
    return React.Children.only(this.props.children);
  }
}

export class ThemeContextProvider extends GenericThemeContextProvider<any> { }
