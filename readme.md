# hyper-statusline [![npm](https://img.shields.io/npm/v/hyper-statusline.svg?maxAge=86400?style=flat-square)](https://www.npmjs.com/package/hyper-statusline) [![npm](https://img.shields.io/npm/dt/hyper-statusline.svg?maxAge=86400?style=flat-square)](https://www.npmjs.com/package/hyper-statusline)

> Status Line Plugin for [Hyper](https://hyper.is). Shows clickable & useful information. Matches any theme.

![](screen.png)


## Install

Add following to the plugins array in your `~/.hyper.js` config.

```javascript
module.exports = {
  ...
  plugins: ['hyper-statusline']
  ...
}
```


## Config

Add following to `~/.hyper.js`.

### Disable Footer Transparency
Default value is set to `false`

```javascript
module.exports = {
  config: {
    ...
      hyperStatusLine: {
        footerTransparent: true,
      }
    ...
  }
}
```

### Change Git Dirty Color
Expected value is `CSS colors`

```javascript
module.exports = {
  config: {
    ...
      hyperStatusLine: {
        dirtyColor: 'pink',
      }
    ...
  }
}
```


## Theme

* [hyperterm-chesterish](https://github.com/henrikdahl/hyperterm-chesterish)


## License

MIT © Henrik Dahlheim
