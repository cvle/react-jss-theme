/*
 * Copyright (C) 2016 wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

declare module "murmurhash-js/murmurhash2_gc" {
  function murmurhash2_32_gc(str: string, seed?: number): number;
  export = murmurhash2_32_gc;
}

declare module "murmurhash-js/murmurhash3_gc" {
  function murmurhash3_32_gc(str: string, seed?: number): number;
  export = murmurhash3_32_gc;
}
