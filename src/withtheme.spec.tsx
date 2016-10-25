/*
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { assert } from "chai";
import { withTheme, removeThemeAttributes, ThemeAttributes } from "./withtheme";
import { ThemeFactory } from "./themefactory";

describe("withtheme.tsx", () => {
  describe("removeThemeAttributes", () => {
    it("should remove theme attributes", () => {
      const attrs: ThemeAttributes<any> = {
        theme: null,
      };
      removeThemeAttributes(attrs);
      assert.isUndefined(attrs.theme);
    });
  });

  describe("withTheme", () => {
    type ThemeVars = { color: string };
    type Theme = { color: string, classes?: { root: any }, deep?: { value1?: number, value2?: number }, jss?: any };
    type Props = { theme?: Theme };
    const themeVars = { color: "blue" };
    const factory: ThemeFactory<ThemeVars, Theme> = (vars, jss) => ({
      color: vars.color,
      classes: {
        root: "root",
      },
      deep: {
        value1: 1,
        value2: 2
      },
      jss,
    });
    const jss: any = {};
    let getWrapper: (props?: ThemeAttributes<Theme>) => ShallowWrapper<ThemeAttributes<Theme>, {}>;

    beforeEach(() => {
      const Themed = withTheme<Props>(factory)((props) => (
        <div>{props.theme.color}</div>
      ));
      getWrapper = (props?) => shallow(<Themed {...props} />, { context: { jss, themeVars } });
    });

    it("should pass JSS to ThemeFactory", () => {
      const { theme } = getWrapper().props();
      assert.strictEqual(theme.jss, jss);
    });

    it("should inject theme", () => {
      const { theme } = getWrapper().props();
      assert.strictEqual(theme.color, themeVars.color);
    });

    describe("custom theme", () => {
      it("should merge custom theme from props", () => {
        const customTheme = {
          color: "custom",
          classes: {
            root: "custom",
          },
        };
        const wrapper = getWrapper({ theme: customTheme });
        const { theme } = wrapper.props();
        assert.strictEqual(theme.color, "custom");
        assert.strictEqual(theme.classes.root, "root custom");
      });
      it("should merge custom theme when changing props", () => {
        const customTheme = {
          color: "custom",
          classes: {
            root: "custom",
          },
          deep: {
            value2: 0,
          },
        };
        const wrapper = getWrapper();
        wrapper.setProps({ theme: customTheme });
        const { theme } = wrapper.props();
        assert.strictEqual(theme.color, "custom");
        assert.strictEqual(theme.classes.root, "root custom");
        assert.strictEqual(theme.deep.value1, 1);
        assert.strictEqual(theme.deep.value2, 0);
      });
    });
  });
});
