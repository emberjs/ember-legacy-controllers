# Ember-proxy-controllers

Ember.ObjectController and Ember.ArrayController extracted as an standalone addon.

## Installation

Run `ember install ember-proxy-controllers` and you're good to go

## Usage

Import the classes from the addon and extend them as with the old `Ember.ArrayController`
and `Ember.ObjectController`

```js
// app/controllers/posts.js
import { ArrayController } from 'ember-proxy-controllers'

export default ArrayController.extend({
})
```


```js
// app/controllers/post.js
import { ObjectController } from 'ember-proxy-controllers'

export default ObjectController.extend({
})
```
