/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import { Theme } from "./theme";


export interface ThemeProviderProps<TThemeConfig> {
  theme: Theme<TThemeConfig>;
}

/**
 * ThemeProvider provides a theme context to all children components.
 */
export class ThemeProvider<TThemeConfig> extends React.Component<ThemeProviderProps<TThemeConfig>, {}> {
  static childContextTypes = {
    theme: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    if (this.props.theme) {
      this.props.theme.attachGlobalStyles();
    }
  }

  componentWillReceiveProps(nextProps: ThemeProviderProps<TThemeConfig>) {
    if (this.props.theme !== nextProps.theme) {
      this.props.theme.detachAll();
      if (nextProps.theme) {
        nextProps.theme.attachGlobalStyles();
      }
    }
  }

  componentWillUnmount() {
    if (this.props.theme) {
      this.props.theme.detachAll();
    }
  }

  getChildContext() {
    return { theme: this.props.theme };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
