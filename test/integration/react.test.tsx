/**
 * @license
 * Copyright (C) 2016 Chi Vinh Le and contributors.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import * as JSS from "jss";
import { mount, ReactWrapper } from "enzyme";
import { assert } from "chai";
import { createDOM, DOM } from "../dom";
import { ThemeContextProvider } from "../../src/themecontextprovider";
import { Button, RawButton, ThemeVars, ButtonProps } from "../fixtures/button";

describe("react integration", () => {
  let jss: JSS.JSS;
  let dom: DOM;

  before(() => {
    dom = createDOM();
    jss = JSS.create();
  });

  after(() => {
    dom.destroy();
  });

  it("should start with no StyleSheets in DOM", () => {
    const styleElements = dom.document.querySelectorAll("style");
    assert.lengthOf(styleElements, 0, "DOM must have zero style elements");
  });

  describe("with themed button", () => {
    const themeVars: ThemeVars = {
      color: "red",
    };
    let wrapper: ReactWrapper<any, {}>;
    let rawButtonWrapper: ReactWrapper<ButtonProps, {}>;
    let htmlButtonWrapper: ReactWrapper<React.HTMLProps<HTMLButtonElement>, {}>;
    let sheet: any;

    const App = (props: ButtonProps) => (
      <ThemeContextProvider
        jss={jss}
        themeVars={themeVars}>
        <Button {...props} />
      </ThemeContextProvider>
    );

    before(() => {
      wrapper = mount(<App />);
    });

    it("should render RawButton", () => {
      rawButtonWrapper = wrapper.find(RawButton);
      assert.lengthOf(rawButtonWrapper, 1, "must render a RawButton component");
    });

    it("should render HTML button", () => {
      htmlButtonWrapper = wrapper.find("button");
      assert.lengthOf(htmlButtonWrapper, 1, "must render a button component");
    });

    it("should attach StyleSheet to the DOM", () => {
      const styleElements = dom.document.querySelectorAll("style");
      assert.lengthOf(styleElements, 1, "DOM must have 1 style elements");
      sheet = styleElements.item(0).sheet;
      const rules = sheet.cssRules[0];
      assert.strictEqual(rules.style.color, themeVars.color,
        "generated StyleSheet must use the theme variables");
    });

    it("should use theme classNames", () => {
      const { selectorText } = sheet.cssRules[0];
      const props = htmlButtonWrapper.props();
      assert.strictEqual(`.${props.className}`, selectorText,
        "StyleSheet selectors and className must match");
    });

    it("should pass theme variables to RawButton", () => {
      const props = rawButtonWrapper.props();
      assert.strictEqual(props.theme.color, themeVars.color,
        "theme variables must match");
    });

    describe("when merging with custom theme", () => {
      before(() => {
        wrapper.setProps({
          theme: {
            color: "custom",
            classes: {
              root: "customClass",
            },
          },
        });
      });

      it("should overwrite theme variables", () => {
        const props = rawButtonWrapper.props();
        assert.strictEqual(props.theme.color, "custom",
          "theme variables must be overwritten");
      });

      it("should merge classNames", () => {
        const { selectorText } = sheet.cssRules[0];
        const props = htmlButtonWrapper.props();
        assert.strictEqual(`${selectorText.substr(1)} customClass`, props.className,
          "customClass must be added to className");
      });
    });
  });
});
