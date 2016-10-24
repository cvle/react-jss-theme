/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { default as defaultJSS } from "jss";

export type ThemeCallback<TThemeVars, TTheme> = (theme?: TThemeVars) => TTheme;
export type ThemeFactory<TThemeVars, TTheme> = (vars: TThemeVars, jss?: JSS.JSS) => TTheme;

let index = 0;

export function createThemeFactory<TThemeVars, TTheme>(
  callback: ThemeCallback<TThemeVars, TTheme>,
  options: JSS.StyleSheetOptions = {}
): ThemeFactory<TThemeVars, TTheme> {
  if (options.index === undefined) {
    index++;
    options.index = index;
  }
  return (vars: TThemeVars, jss: JSS.JSS = defaultJSS) => {
    const theme: any = callback(vars);
    const sheet = jss.createStyleSheet(theme.classes, options);
    sheet.attach();
    theme.classes = sheet.classes;
    return theme;
  };
}
