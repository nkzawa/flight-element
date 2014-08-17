flight-element
==============
[![Build Status](https://travis-ci.org/nkzawa/flight-element.svg)](https://travis-ci.org/nkzawa/flight-element)

Flight mixin for creating custom elements.

```js
var element = require('flight-element');

return element.registerElement('x-foo', {
  component: defineComponent(foo)
});

function foo() {
  // ...
}
```

```html
<div f-is="x-foo"></div>
```

## Installation

```bash
bower install --save flight-element
```

## API documentation

### element.registerElement(type, options)

Register a new custom element and returns its component constructor. Also all existing elements would be upgraded. The `type` must contain a dash (-).

```js
var FooButton = element.registerelement('x-foo-button', {
  component: defineComponent(fooButton),
  extends: 'button'
});

function fooButton() {
  this.attributes({ hoverClass: null });
}
```

```html
<button f-is="x-foo-button" f-hoverClass="hover"></button>
```

### element.upgradeElement(selector [, type])

Upgrade selected elements and its descendants to registered custom elements.

```js
element.upgradeElement(document);
element.upgradeElement('.container', 'x-foo-button');
```

### element.prefix

Setting for the attribute prefix. It default to `f`.

```js
element.prefix = null;
```

```html
<div is="x-foo"></div>
```

### this.renderContent(content)

Render `content` and upgrade all child custom elements.

```js
this.renderContent('<span>hi</span>');
```

Insert contents from host to the insertion point (`<xxx f-is="content">`).

```js
this.renderContent('Hello, <span f-is="content"/>');
```

```html
<div f-is="x-foo"><span class="name">World<span></div>
```

Result:

```html
<div f-is="x-foo">Hello, <span class="name">World<span></div>
```

### this.upgradeElement([attr])

Upgrade all matching elements within the component's `node`.

```js
this.attributes({ item: '.item' });
this.upgradeElement('item');
```

## License

MIT
