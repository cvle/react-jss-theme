import * as React from "react";
import { Theme } from "./theme";

export interface ThemeProviderProps {
  theme: Theme;
}

export class ThemeProvider extends React.Component<ThemeProviderProps, {}> {
  static childContextTypes = {
    theme: React.PropTypes.object.isRequired,
  };

  getChildContext() {
    return { theme: this.props.theme };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
