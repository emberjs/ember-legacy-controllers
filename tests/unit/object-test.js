import Ember from 'ember';
import { module, test } from 'qunit';
import ObjectController from 'ember-proxy-controllers/object';

const { observer } = Ember;

module('ObjectController');

test('should be able to set the target property of an ObjectController', function(assert) {
  var controller = ObjectController.create();
  var target = {};

  controller.set('target', target);
  assert.equal(controller.get('target'), target, 'able to set the target property');
});

// See https://github.com/emberjs/ember.js/issues/5112
test('can observe a path on an ObjectController', function(assert) {
  var controller = ObjectController.extend({
    baz: observer('foo.bar', function() {})
  }).create();
  controller.set('model', {});
  assert.ok(true, 'should not fail');
});
