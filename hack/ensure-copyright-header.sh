#!/bin/bash

# Copyright (C) 2016 wikiwi.io
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

shopt -s globstar

read -d '' ASTERISK_HEADER <<EOL
/*
 * Copyright (C) $(date +%Y) wikiwi.io
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
EOL

for f in src/**/*.ts src/**/*.tsx; do
  if ! grep -q "Copyright (C)" "$f"
  then
    echo "Adding license notice to $f"
    echo -e "${ASTERISK_HEADER}\n" > "$f.new" && cat "$f" >> "$f.new" && mv "$f.new" "$f"
  fi
done
