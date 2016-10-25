/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as JSS from "jss";
import { assert } from "chai";
import { createThemeFactory, ThemeFactory } from "../../src/themefactory";
import { createDOM, DOM } from "../dom";
import DomRenderer from "jss/lib/backends/DomRenderer";

describe("basic usage", () => {
  let jss: JSS.JSS;
  let dom: DOM;

  before(() => {
    dom = createDOM();
    jss = JSS.create();
  });

  after(() => {
    dom.destroy();
  });

  describe("with a theme factory", () => {
    type ThemeVars = { color: string };
    type Theme = { color: string, classes: { root: any } };
    const themeVars: ThemeVars = { color: "red" };
    let factory: ThemeFactory<ThemeVars, Theme>;

    before(() => {
      factory = createThemeFactory<ThemeVars, Theme>((vars) => ({
        color: vars.color,
        classes: {
          root: {
            color: vars.color,
          },
        },
      }), { Renderer: DomRenderer } as any);
    });

    it("should not include StyleSheets in DOM", () => {
      const styleElements = dom.document.querySelectorAll("style");
      assert.lengthOf(styleElements, 0, "DOM must have zero style elements");
    });

    describe("when creating a theme", () => {
      let theme: Theme;
      let sheet: any;
      before(() => {
        theme = factory(themeVars, jss);
      });

      it("should attach StyleSheet to the DOM", () => {
        const styleElements = dom.document.querySelectorAll("style");
        assert.lengthOf(styleElements, 1, "DOM must have 1 style elements");
        sheet = styleElements.item(0).sheet;
        const rules = sheet.cssRules[0];
        assert.strictEqual(rules.style.color, themeVars.color,
          "generated StyleSheet must use the theme variables");
      });

      it("should return CSS classNames", () => {
        const { selectorText } = sheet.cssRules[0];
        assert.strictEqual(`.${theme.classes.root}`, selectorText,
          "StyleSheet selectors and theme.classes must match");
      });
    });
  });
});
