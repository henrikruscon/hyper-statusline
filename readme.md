# hyper-statusline [![hyper](https://img.shields.io/badge/Hyper-v1.3.3-brightgreen.svg)](https://github.com/zeit/hyper/releases/tag/1.3.3) [![npm](https://img.shields.io/npm/v/hyper-statusline.svg?maxAge=86400?style=flat-square)](https://www.npmjs.com/package/hyper-statusline) [![npm](https://img.shields.io/npm/dt/hyper-statusline.svg?maxAge=86400?style=flat-square)](https://www.npmjs.com/package/hyper-statusline)

> Status Line Plugin for [Hyper](https://hyper.is). Shows clickable & useful information. Matches any theme.

![hyper-statusline](https://cloud.githubusercontent.com/assets/1430576/21891665/14d29070-d8d4-11e6-9e98-b12ed28be93a.png)


## Install

Add following to your `~/.hyper.js` config.

```javascript
module.exports = {
  ...
  plugins: ['hyper-statusline']
  ...
}
```


## Config

Add following to `~/.hyper.js`

### Change Git Dirty Color
Expected value is `CSS color`

```javascript
module.exports = {
  config: {
    ...
      hyperStatusLine: {
        dirtyColor: 'salmon',
      }
    ...
  }
}
```

### Change Git Ahead Color
Expected value is `CSS color`

```javascript
module.exports = {
  config: {
    ...
      hyperStatusLine: {
        aheadColor: 'ivory',
      }
    ...
  }
}
```

### Disable Footer Transparency
Default value is set to `true`

```javascript
module.exports = {
  config: {
    ...
      hyperStatusLine: {
        footerTransparent: false,
      }
    ...
  }
}
```


## Theme

* [hyper-chesterish](https://github.com/henrikdahl/hyper-chesterish)


## License

MIT © Henrik
