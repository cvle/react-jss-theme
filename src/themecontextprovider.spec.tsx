/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { assert } from "chai";
import { ThemeContextProvider, GenericThemeContextProvider, ThemeContext } from "./themecontextprovider";

// Compile-time check for GenericThemeContextProvider.
class VoidThemeContextProvider extends GenericThemeContextProvider<void> { }

describe("<ThemeContextProvider>", () => {
  describe("defaults", () => {
    let wrapper: ShallowWrapper<any, any>;
    let instance: ThemeContextProvider;
    let context: ThemeContext<any>;

    before(() => {
      wrapper = shallow(
        <ThemeContextProvider><span>Dummy</span></ThemeContextProvider>
      );
      instance = wrapper.instance() as ThemeContextProvider;
      context = instance.getChildContext();
    });

    it("should provide a default JSS", () => {
      assert.isObject(context.jss);
    });

    it("should use empty theme", () => {
      assert.isNull(context.themeVars);
    });
  });

  describe("props", () => {
    const jss: any = {};
    const themeVars = {};
    let wrapper: ShallowWrapper<any, any>;
    let instance: ThemeContextProvider;

    before(() => {
      wrapper = shallow(
        <ThemeContextProvider
          themeVars={themeVars}
          jss={jss}>
          <span>Dummy</span>
        </ThemeContextProvider>
      );
      instance = wrapper.instance() as ThemeContextProvider;
    });

    it("should relay props to context", () => {
      const context = instance.getChildContext();
      assert.strictEqual(context.jss, jss);
      assert.strictEqual(context.themeVars, themeVars);
    });

    it("should handle prop change", () => {
      const nextJSS: any = {};
      const nextThemeVars = {};
      wrapper.setProps({ themeVars: nextThemeVars, jss: nextJSS });
      const context = instance.getChildContext();
      assert.strictEqual(context.jss, nextJSS);
      assert.strictEqual(context.themeVars, nextThemeVars);
    });
  });
});
