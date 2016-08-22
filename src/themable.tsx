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
}


/**
 * makeThemable wraps component with a HOC providing theming capabilities.
 *
 * @param TargetComponent  The target component to make themable.
 * @param propName         The name of the property containing a list of styles to fetch from the theme.
 * @param defaultStyleName The default style to fetch from the theme.
 */
export function makeThemable<T extends ThemableProps>(TargetComponent: React.ComponentClass<T>, propName: string, defaultStyleNames = ""): React.ComponentClass<T> {
    let enhanced = class extends React.Component<T, void> {
      context: Context;

      private classes: any;
      private sheetRefs: Array<StyleSheetReference>;

      constructor(props) {
        super(props);
        this.sheetRefs = new Array<StyleSheetReference>();
      }

      componentWillMount() {
        if (!this.context.theme) {
          return;
        }
        // TODO: process a list of style names.
        let styleName = this.props[propName];
        if (!styleName) {
          styleName = defaultStyleNames;
        }
        let ref = this.context.theme.require(styleName);
        if (!ref) {
          console.error(`Style name '${styleName}' was not found in template.`);
          return;
        }
        this.classes = ref.classes;
        this.sheetRefs.push(ref);
      }

      componentWillUnmount() {
        for (let ref of this.sheetRefs) {
          ref.release();
        }
      }

      public render() {
        let props = objectAssign({}, this.props);
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
    enhanced.displayName = "Themable";
    return enhanced;
}

/**
 * Themable calls makeThemable but has a Decorator signature.
 */
export function Themable<T extends ThemableProps>(propName: string, defaultStyleNames = ""): (target: React.ComponentClass<T>) => any {
  return (target: React.ComponentClass<T>) => {
    return makeThemable(target, propName, defaultStyleNames);
  };
}
