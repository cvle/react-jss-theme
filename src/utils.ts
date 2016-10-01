/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createHash = require("murmurhash-js/murmurhash3_gc");

export function generateClassName(str: string, rule: JSS.Rule): string {
  if (rule.name) {
    const dashedRuleName = rule.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    if (rule.options.sheet) {
      const sheet = rule.options.sheet;
      if (sheet.options.meta) {
        const sheetMeta = rule.options.sheet.options.meta;
        return `${sheetMeta}-${dashedRuleName}`;
      }
    }
    return `${dashedRuleName}-${createHash(str)}`;
  }
  return `${createHash(str)}`;
}
