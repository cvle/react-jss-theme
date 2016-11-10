/**
 * @license
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import * as objectAssign from "object-assign";
import DomRenderer from "jss/lib/backends/DomRenderer";
import { withTheme } from "../../src/withtheme";
import { createThemeFactory } from "../../src/themefactory";

export interface ThemeVars {
  color: string;
}

export interface ButtonTheme {
  color: string;
  classes: {
    root: any;
  };
}

export interface ButtonProps {
  theme?: ButtonTheme;
}

const themeFactory = createThemeFactory<ThemeVars, ButtonTheme>(
  (vars) => ({
    color: vars.color,
    classes: {
      root: {
        color: vars.color,
      },
    },
  }), { Renderer: DomRenderer } as any);

export class RawButton extends React.PureComponent<ButtonProps, {}> {
  public render(): React.ReactElement<any> {
    const { theme } = this.props;
    const other = objectAssign({}, this.props);
    delete other.theme;
    return <button className={theme.classes.root} {...other} />;
  }
}

export const Button = withTheme(themeFactory)(RawButton);
