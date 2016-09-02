/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {Rule } from "jss";
import createHash = require("murmurhash-js/murmurhash3_gc");

export function generateClassName(str: string, rule: Rule): string {
  if (rule.name) {
    if (rule.options.sheet) {
      const sheet = rule.options.sheet;
      if (sheet.options.meta) {
        const sheetMeta = rule.options.sheet.options.meta;
        return `${sheetMeta}-${rule.name}`;
      }
    }
    return `${rule.name}-${createHash(str)}`;
  }
  return `${createHash(str)}`;
}
