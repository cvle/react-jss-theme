# react-jss-theme

Theming solution for React based on JSS.

[![NPM Version Widget]][npm version]
[![Build Status Widget]][build status]
[![Coverage Status Widget]][coverage status]

## Installation

```sh
npm install react-jss-theme --save
```

## Usage

### Define a theme

```javascript
const factory = createThemeFactory(
  (vars) => ({
    color: vars.color,
    classes: {
      root: {
        color: vars.color,
      },
    },
  }));

const theme = factory({ color: "red" });
console.log(theme);
```

Result:
```javascript
{
  color: "red",
  classes: {
    root: "root-123456"
  }
}
```

### Integrate with React

TODO

## API

TODO

[npm version]: https://www.npmjs.com/package/react-jss-theme

[npm version widget]: https://img.shields.io/npm/v/react-jss-theme.svg?style=flat-square

[build status]: https://travis-ci.org/wikiwi/react-jss-theme

[build status widget]: https://img.shields.io/travis/wikiwi/react-jss-theme/master.svg?style=flat-square

[coverage status]: https://coveralls.io/github/wikiwi/react-jss-theme?branch=master

[coverage status widget]: https://img.shields.io/coveralls/wikiwi/react-jss-theme/master.svg?style=flat-square
