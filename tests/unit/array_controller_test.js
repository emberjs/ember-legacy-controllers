import Ember from 'ember';
import { module, test } from 'qunit';
import { ArrayController } from 'ember-proxy-controllers';
import expectAssertion from 'ember-dev/test-helper/assertion';


const { get, set } = Ember;

module('ArrayController');

test('defaults its `model` to an empty array', function (assert) {
  var Controller = ArrayController.extend();
  assert.deepEqual(Controller.create().get('model'), [], '`ArrayController` defaults its model to an empty array');
  assert.equal(Controller.create().get('firstObject'), undefined, 'can fetch firstObject');
  assert.equal(Controller.create().get('lastObject'), undefined, 'can fetch lastObject');
});

test('Ember.ArrayController length property works even if model was not set initially', function(assert) {
  var controller = ArrayController.create();
  controller.pushObject('item');
  assert.equal(controller.get('length'), 1);
});

test('works properly when model is set to an Ember.A()', function(assert) {
  var controller = ArrayController.create();

  set(controller, 'model', Ember.A(['red', 'green']));

  assert.deepEqual(get(controller, 'model'), ['red', 'green'], 'can set model as an Ember.Array');
});

test('works properly when model is set to a plain array', function(assert) {
  var controller = ArrayController.create();

  if (Ember.EXTEND_PROTOTYPES) {
    set(controller, 'model', ['red', 'green']);

    assert.deepEqual(get(controller, 'model'), ['red', 'green'], 'can set model as a plain array');
  } else {
    assert.expect(0);
    expectAssertion(function() {
      set(controller, 'model', ['red', 'green']);
    }, /ArrayController expects `model` to implement the Ember.Array mixin. This can often be fixed by wrapping your model with `Ember\.A\(\)`./);
  }
});

test('works properly when model is set to `null`', function(assert) {
  var controller = ArrayController.create();

  set(controller, 'model', null);
  assert.equal(get(controller, 'model'), null, 'can set model to `null`');

  set(controller, 'model', undefined);
  assert.equal(get(controller, 'model'), undefined, 'can set model to `undefined`');

  set(controller, 'model', false);
  assert.equal(get(controller, 'model'), false, 'can set model to `undefined`');
});
