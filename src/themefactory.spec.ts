/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { assert } from "chai";
import { stub } from "sinon";
import { createThemeFactory, ThemeFactory } from "./themefactory";

describe("themefactory.ts", () => {
  let jss: JSS.JSS;
  let attach: Sinon.SinonStub;
  let createStyleSheet: Sinon.SinonStub;
  const classes = { root: "stub" };

  beforeEach(() => {
    attach = stub().returns(classes);
    createStyleSheet = stub().returns({ attach, classes });
    jss = {
      sheets: { registry: [] },
      createStyleSheet,
    } as any;
  });

  describe("createThemeFactory()", () => {
    it("should subsequently return stylesheet with ascending index when not specified", () => {
      createThemeFactory(() => ({}))({}, jss);
      createThemeFactory(() => ({}), { index: 100 })({}, jss);
      createThemeFactory(() => ({}))({}, jss);
      createThemeFactory(() => ({}))({}, jss);
      const idx: number[] = [];
      for (let i = 0; i < 4; i++) {
        idx[i] = createStyleSheet.getCall(i).args[1].index;
      }
      assert.equal(idx[1], 100,
        "custom index must remain");
      assert.isTrue(idx[2] > idx[0],
        "index must be ascending");
      assert.isTrue(idx[3] > idx[2],
        "index must be ascending");
    });
  });

  describe("ThemeFactory", () => {
    type ThemeVars = { color?: string };
    type Theme = { primaryColor: string, classes: { root: any } };
    let factory: ThemeFactory<ThemeVars, Theme>;

    before(() => {
      factory = createThemeFactory<ThemeVars, Theme>(
        (vars) => ({
          primaryColor: vars.color,
          classes: {
            root: {
              color: vars.color,
            },
          },
        }), { meta: "test" }
      );
    });

    it("should attach style sheet", () => {
      factory({}, jss);
      assert.equal(attach.callCount, 1,
        "style sheet was not attached");
    });

    it("should return theme", () => {
      const red = "red";
      const theme = factory({ color: red }, jss);
      assert.equal(theme.primaryColor, red, "incorrect theme");
      assert.strictEqual(theme.classes.root, "stub", "incorrect theme");
    });

    it("should pass options to style sheet", () => {
      factory({}, jss);
      const { meta } = createStyleSheet.getCall(0).args[1];
      assert.equal(meta, "test",
        "options was not passed to style sheet");
    });
  });
});
