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

describe("specifity", () => {
  let jss: JSS.JSS;
  let dom: DOM;

  before(() => {
    dom = createDOM();
    jss = JSS.create();
  });

  after(() => {
    dom.destroy();
  });

  describe("with multiple theme factories", () => {
    type ThemeVars = { color: string };
    type Theme = { color: string, classes: { root: any } };
    const themeVars: ThemeVars = { color: "red" };
    let factory: Array<ThemeFactory<ThemeVars, Theme>>;

    before(() => {
      factory = [];
      for (let i = 0; i < 10; i++) {
        factory[i] = createThemeFactory<ThemeVars, Theme>((vars) => ({
          color: vars.color,
          classes: {
            root: {
              color: vars.color,
            },
          },
        }), { Renderer: DomRenderer, meta: i } as any);
      }
    });

    it("should not include StyleSheets in DOM", () => {
      const styleElements = dom.document.querySelectorAll("style");
      assert.lengthOf(styleElements, 0, "DOM must have zero style elements");
    });

    describe("when creating themes from different factories", () => {
      before(() => {
        factory[5](themeVars, jss);
        factory[2](themeVars, jss);
        factory[7](themeVars, jss);
      });

      describe("StyleSheets", () => {
        let styleElements: NodeListOf<HTMLStyleElement>;
        before(() => {
          styleElements = dom.document.querySelectorAll("style");
        });

        it("should attach to DOM", () => {
          assert.lengthOf(styleElements, 3, "DOM must have 3 style elements");
        });

        it("should preserve order according to when the factory was created", () => {
          const factoryIDs = [
            styleElements.item(0).getAttribute("data-meta"),
            styleElements.item(1).getAttribute("data-meta"),
            styleElements.item(2).getAttribute("data-meta"),
          ];
          assert.deepEqual(factoryIDs, ["2", "5", "7"]);
        });
      });
    });

    describe("when creating themes from the same factory", () => {
      before(() => {
        factory[5](themeVars, jss);
        factory[5](themeVars, jss);
        factory[5]({ color: "last" }, jss);
      });

      describe("StyleSheets", () => {
        let styleElements: NodeListOf<HTMLStyleElement>;
        before(() => {
          styleElements = dom.document.querySelectorAll("style");
        });

        it("should attach to DOM", () => {
          assert.lengthOf(styleElements, 6, "DOM must have 6 style elements");
        });

        it("should be attached after the StyleSheets of the same factory", () => {
          const factoryIDs = [
            styleElements.item(1).getAttribute("data-meta"),
            styleElements.item(2).getAttribute("data-meta"),
            styleElements.item(3).getAttribute("data-meta"),
            styleElements.item(4).getAttribute("data-meta"),
          ];
          assert.deepEqual(factoryIDs, ["5", "5", "5", "5"]);
          const sheet: any = styleElements.item(4).sheet;
          const rules = sheet.cssRules[0];
          assert.strictEqual(rules.style.color, "last",
            "last StyleSheet must match last theme");
        });
      });
    });
  });
});
