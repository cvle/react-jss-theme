/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as React from "react";
import objectAssign = require("object-assign");

import { Theme, StyleSheetReference } from "./theme";

/** Context is an interface of the context passed by themeprovider */
export interface Context {
  theme: Theme;
}

/**
 * ThemableProps is an interface for the properties passed by the
 * Themable HOC to the target Component
 */
export interface ThemableProps {
  /** classes contains the css classes from the Theme */
  classes?: any;

  /** styleName contains the style names from the Theme */
  styleName?: string;
}

/**
 * makeThemable wraps component with a HOC providing theming capabilities.
 *
 * @param TargetComponent  The target component to make themable.
 * @param defaultStyleName The default style to fetch from the theme.
 */
export function makeThemable<T extends ThemableProps>(TargetComponent: React.ComponentClass<T>, defaultStyleNames = ""): React.ComponentClass<T> {
  let enhanced = class extends React.Component<T, void> {
    context: Context;

    private classes: any;
    private sheetRefs: Array<StyleSheetReference>;

    constructor(props) {
      super(props);
      this.sheetRefs = new Array<StyleSheetReference>();
      this.classes = {};
    }

    private toStyleNameArray(...styleName: Array<string>): Array<string> {
      let computed = new Array<string>();
      for (let name of styleName) {
        if (!name || !name.trim()) {
          continue;
        }
        let items = name.split("\s+");
        for (let i of items) {
          let trimed = i.trim();
          if (trimed && computed.indexOf(trimed) === -1) {
            computed.push(trimed);
          }
        }
      }
      return computed;
    }

    componentWillMount() {
      if (!this.context.theme) {
        return;
      }
      let styleNames = this.toStyleNameArray(defaultStyleNames, this.props["styleName"]);
      for (let styleName of styleNames) {

        let ref = this.context.theme.require(styleName);
        if (!ref) {
          console.error(`Style name '${styleName}' was not found in template.`);
          return;
        }
        for (let className of Object.keys(ref.classes)) {
          if (this.classes[className] === undefined) {
            this.classes[className] = ref.classes[className];
            continue;
          }
          this.classes[className] += " " + ref.classes[className];
        }
        this.sheetRefs.push(ref);
      }
    }

    componentWillUnmount() {
      for (let ref of this.sheetRefs) {
        ref.release();
      }
    }

    public render() {
      let styleName = this.toStyleNameArray(defaultStyleNames, this.props["styleName"]).join(" ");
      let props = objectAssign({}, this.props, { styleName: styleName });
      if (this.classes) {
        props["classes"] = this.classes;
      }
      return <TargetComponent {...props} />;
    }
  } as React.ComponentClass<T>;
  // Add expected context type to receive the context.
  enhanced.contextTypes = {
    theme: React.PropTypes.object,
  };
  enhanced.displayName = `hoc.Themable`;
  return enhanced;
}

/**
 * Themable calls makeThemable but has a Decorator signature.
 */
export function Themable<T extends ThemableProps>(defaultStyleNames = ""): (target: React.ComponentClass<T>) => any {
  return (target: React.ComponentClass<T>) => {
    return makeThemable(target, defaultStyleNames);
  };
}
