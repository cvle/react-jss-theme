# react-jss-theme

Theming solution for React based on JSS that follows the ideas of
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
import { createThemeFactory, withTheme, ThemeContextProvider } from "react-jss-theme"

const themeFactory = createThemeFactory(
  (vars) => ({
    color: vars.color,
    classes: {
      button: {
        backgroundColor: vars.color
      },
      label: {
        fontWeight: "bold"
      }
    }
  }))

const RawButton = ({ theme: { color, classes }, children }) => (
  <button className={ classes.button } data-color={ color }>
    <span className={ classes.label }>
      {children}
    </span>
  </button>
)

const Button = withTheme(themeFactory)(Button)

const App = () => (
  <ThemeContextProvider themeVars={{ color: "red" }}>
    <Button>Hello</Button>
  </ThemeContextProvider>
)

ReactDOM.render(<App />, mountNode)
```

### With decorator syntax

```javascript
@withTheme(themeFactory)
const Button = ({ theme: { color, classes }, children }) => (
  <button className={ classes.button } data-color={ color }>
    <span className={ classes.label }>
      {children}
    </span>
  </button>
)
```

### Customize component theme

Components wrapped with the `withTheme` decorator, accepts a `theme` attribute,
which merges with the component theme. Class names are never overwritten
but appended to the existing ones.

 ```javascript
const themeFactory = createThemeFactory(
  (vars) => ({
    color: "blue",
    classes: {
      button: {
        backgroundColor: "blue"
      },
      label: {
        fontWeight: "normal"
      }
    }
  }))

@withTheme(themeFactory)
const CustomButton = ({ theme, children }) => (
  <Button theme={ theme }>{ children }</Button>
)

```

### Passing a custom JSS instance

```javascript
const App = () => (
  <ThemeContextProvider themeVars={ myThemeVars } jss={ myCustomJSS }>
    <Button>Hello</Button>
  </ThemeContextProvider>
)
```

### Passing style sheet options

```javascript
const themeFactory = createThemeFactory(
  (vars) => ({
    color: vars.color,
    classes: {
      button: {
        backgroundColor: vars.color
      },
      label: {
        fontWeight: "bold"
      }
    }
  }), { meta: "my-button-theme" })
```

For all available options consult the [JSS API Documentation](https://github.com/cssinjs/jss/blob/master/docs/js-api.md#create-style-sheet-with-namespaces-enabled).

[npm version]: https://www.npmjs.com/package/react-jss-theme

[npm version widget]: https://img.shields.io/npm/v/react-jss-theme.svg?style=flat-square

[build status]: https://travis-ci.org/wikiwi/react-jss-theme

[build status widget]: https://img.shields.io/travis/wikiwi/react-jss-theme/master.svg?style=flat-square

[coverage status]: https://coveralls.io/github/wikiwi/react-jss-theme?branch=master

[coverage status widget]: https://img.shields.io/coveralls/wikiwi/react-jss-theme/master.svg?style=flat-square
