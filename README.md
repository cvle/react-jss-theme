# react-jss-theme

Theming solution for React based on JSS that follows the idea of
[future-react-ui](https://github.com/nikgraf/future-react-ui) and
[theme-standard](https://github.com/theme-standard/spec). In fact
you can implement the theme-standard spec using this solution.

[![NPM Version Widget]][npm version]
[![Build Status Widget]][build status]
[![Coverage Status Widget]][coverage status]

## Installation

```sh
npm install react-jss-theme --save
```

## Usage

```javascript
import { createThemeFactory, withTheme, ThemeContextProvider } from "react-jss-theme";

const themeFactory = createThemeFactory(
  (vars) => ({
    color: vars.color,
    classes: {
      button: {
        backgroundColor: vars.color,
      },
      label: {
        fontWeight: "bold",
      },
    },
  }));

const RawButton = ({ theme: { color, classes }, children }) => (
  <button className={ classes.button } data-color={ color }>
    <span className={ classes.label }>
      {children}
    </span>
  </button>
)

const Button = withTheme(themeFactory)(Button)

const App = () => (
  <ThemeContextProvider themeVars={ color: "red" }>
    <Button>Hello</Button>
  </ThemeContextProvider>
)

ReactDOM.render(<App />, mountNode);
```

[npm version]: https://www.npmjs.com/package/react-jss-theme

[npm version widget]: https://img.shields.io/npm/v/react-jss-theme.svg?style=flat-square

[build status]: https://travis-ci.org/wikiwi/react-jss-theme

[build status widget]: https://img.shields.io/travis/wikiwi/react-jss-theme/master.svg?style=flat-square

[coverage status]: https://coveralls.io/github/wikiwi/react-jss-theme?branch=master

[coverage status widget]: https://img.shields.io/coveralls/wikiwi/react-jss-theme/master.svg?style=flat-square
