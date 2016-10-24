/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export type ThemeCallback<TThemeVars, TTheme> = (theme?: TThemeVars) => TTheme;
export type ThemeFactory<TThemeVars, TTheme> = (jss: JSS.JSS, theme: TThemeVars) => TTheme;

let index = 0;

export function createThemeFactory<TThemeVars, TTheme>(
  callback: ThemeCallback<TThemeVars, TTheme>,
  options: JSS.StyleSheetOptions = {}
): ThemeFactory<TThemeVars, TTheme> {
  if (options.index === undefined) {
    index++;
    options.index = index;
  }
  return (jss: JSS.JSS, vars: TThemeVars) => {
    const theme: any = callback(vars);
    const sheet = jss.createStyleSheet(theme.classes, options);
    sheet.attach();
    theme.classes = sheet.classes;
    return theme;
  };
}