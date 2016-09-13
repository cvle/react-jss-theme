/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import { Theme } from "./theme";


export interface ThemeProviderProps {
  theme: Theme;
}

/**
 * ThemeProvider provides a theme context to all children components.
 */
export class ThemeProvider extends React.Component<ThemeProviderProps, {}> {
  static childContextTypes = {
    theme: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    if (this.props.theme) {
      this.props.theme.mountGlobalStyles();
    }
  }

  componentWillReceiveProps(nextProps: ThemeProviderProps) {
    if (this.props.theme !== nextProps.theme) {
      this.props.theme.unmountGlobalStyles();
      if (nextProps.theme) {
        nextProps.theme.mountGlobalStyles();
      }
    }
  }

  componentWillUnmount() {
    if (this.props.theme) {
      this.props.theme.unmountGlobalStyles();
    }
  }

  getChildContext() {
    return { theme: this.props.theme };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
