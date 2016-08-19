import * as React from "react";
import objectAssign = require("object-assign");

import { Theme, StyleSheetReference } from "./theme";

export interface Context {
  theme: Theme;
}

export interface ThemableProps<T> {
  classes?: T;
}

export function makeThemable<T extends ThemableProps<any>>(TargetComponent: React.ComponentClass<T>, propName: string, defaultStyleNames = ""): React.ComponentClass<T> {
    let enhanced = class extends React.Component<T, void> {
      context: Context;

      private classes: any;
      private sheetRefs: Array<StyleSheetReference<any>>;

      constructor(props) {
        super(props);
        this.sheetRefs = new Array<StyleSheetReference<any>>();
      }

      componentWillMount() {
        if (!this.context.theme) {
          return;
        }
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
    };
    // Add expected context type to receive the context.
    (enhanced as any).contextTypes = {
      theme: React.PropTypes.object,
    };
    return enhanced;
}

export function Themable<T extends ThemableProps<any>>(propName: string, defaultStyleNames = ""): (target: React.ComponentClass<T>) => any {
  return (target: React.ComponentClass<T>) => {
    return makeThemable(target, propName, defaultStyleNames);
  };
}
