import Ember from 'ember';
import { module, test } from 'qunit';
import ArrayController from 'ember-proxy-controllers/array';

const {
  guidFor,
  run,
  get,
  computed,
  compare,
  Controller,
  Registry,
  Object: EmberObject
} = Ember;
const { sort } = computed;

var lannisters, arrayController, controllerClass, otherControllerClass, registry, container, itemControllerCount,
    tywin, jaime, cersei, tyrion;

module('Ember.ArrayController - itemController', {
  setup() {
    registry = new Registry();
    container = registry.container();

    tywin = EmberObject.create({ name: 'Tywin' });
    jaime = EmberObject.create({ name: 'Jaime' });
    cersei = EmberObject.create({ name: 'Cersei' });
    tyrion = EmberObject.create({ name: 'Tyrion' });
    lannisters = Ember.A([tywin, jaime, cersei]);

    itemControllerCount = 0;
    controllerClass = Controller.extend({
      init() {
        ++itemControllerCount;
        this._super.apply(this, arguments);
      },

      toString() {
        return 'itemController for ' + this.get('name');
      }
    });

    otherControllerClass = Controller.extend({
      toString() {
        return 'otherItemController for ' + this.get('name');
      }
    });

    registry.register('controller:Item', controllerClass);
    registry.register('controller:OtherItem', otherControllerClass);
  },
  teardown() {
    run(function() {
      container.destroy();
    });
    registry = container = null;
  }
});

function createUnwrappedArrayController() {
  arrayController = ArrayController.create({
    container: container,
    model: lannisters
  });
}

function createArrayController() {
  arrayController = ArrayController.create({
    container: container,
    itemController: 'Item',
    model: lannisters
  });
}

function createDynamicArrayController() {
  arrayController = ArrayController.create({
    container: container,
    lookupItemController(object) {
      if ('Tywin' === object.get('name')) {
        return 'Item';
      } else {
        return 'OtherItem';
      }
    },
    model: lannisters
  });
}

test('when no `itemController` is set, `objectAtContent` returns objects directly', function(assert) {
  createUnwrappedArrayController();

  assert.strictEqual(arrayController.objectAtContent(1), jaime, 'No controller is returned when itemController is not set');
});

test('when `itemController` is set, `objectAtContent` returns an instance of the controller', function(assert) {
  createArrayController();

  var jaimeController = arrayController.objectAtContent(1);

  assert.ok(controllerClass.detectInstance(jaimeController), 'A controller is returned when itemController is set');
});


test('when `idx` is out of range, `objectAtContent` does not create a controller', function(assert) {
  controllerClass.reopen({
    init() {
      assert.ok(false, 'Controllers should not be created when `idx` is out of range');
    }
  });

  createArrayController();
  assert.strictEqual(arrayController.objectAtContent(50), undefined, 'no controllers are created for out of range indexes');
});

test('when the underlying object is null, a controller is still returned', function(assert) {
  createArrayController();
  arrayController.unshiftObject(null);
  var firstController = arrayController.objectAtContent(0);
  assert.ok(controllerClass.detectInstance(firstController), 'A controller is still created for null objects');
});

test('the target of item controllers is the parent controller', function(assert) {
  createArrayController();

  var jaimeController = arrayController.objectAtContent(1);

  assert.equal(jaimeController.get('target'), arrayController, 'Item controllers\' targets are their parent controller');
});

test('the parentController property of item controllers is set to the parent controller', function(assert) {
  createArrayController();

  var jaimeController = arrayController.objectAtContent(1);

  assert.equal(jaimeController.get('parentController'), arrayController, 'Item controllers\' targets are their parent controller');
});

test('when the underlying object has not changed, `objectAtContent` always returns the same instance', function(assert) {
  createArrayController();

  assert.strictEqual(arrayController.objectAtContent(1), arrayController.objectAtContent(1), 'Controller instances are reused');
});

test('when the index changes, `objectAtContent` still returns the same instance', function(assert) {
  createArrayController();
  var jaimeController = arrayController.objectAtContent(1);
  arrayController.unshiftObject(tyrion);

  assert.strictEqual(arrayController.objectAtContent(2), jaimeController, 'Controller instances are reused');
});

test('when the underlying array changes, old subcontainers are destroyed', function(assert) {
  createArrayController();
  // cause some controllers to be instantiated
  arrayController.objectAtContent(1);
  arrayController.objectAtContent(2);

  // Not a public API; just checking for cleanup
  var subControllers = get(arrayController, '_subControllers');
  var jaimeController = subControllers[1];
  var cerseiController = subControllers[2];

  assert.equal(!!jaimeController.isDestroying, false, 'precond - nobody is destroyed yet');
  assert.equal(!!cerseiController.isDestroying, false, 'precond - nobody is destroyed yet');

  run(function() {
    arrayController.set('model', Ember.A());
  });

  assert.equal(!!jaimeController.isDestroying, true, 'old subcontainers are destroyed');
  assert.equal(!!cerseiController.isDestroying, true, 'old subcontainers are destroyed');
});


test('item controllers are created lazily', function(assert) {
  createArrayController();

  assert.equal(itemControllerCount, 0, 'precond - no item controllers yet');

  arrayController.objectAtContent(1);

  assert.equal(itemControllerCount, 1, 'item controllers are created lazily');
});

test('when items are removed from the arrayController, their respective subcontainers are destroyed', function(assert) {
  createArrayController();
  var jaimeController = arrayController.objectAtContent(1);
  var cerseiController = arrayController.objectAtContent(2);
  get(arrayController, '_subControllers');

  assert.equal(!!jaimeController.isDestroyed, false, 'precond - nobody is destroyed yet');
  assert.equal(!!cerseiController.isDestroyed, false, 'precond - nobody is destroyed yet');

  run(function() {
    arrayController.removeObject(cerseiController);
  });

  assert.equal(!!cerseiController.isDestroying, true, 'Removed objects\' containers are cleaned up');
  assert.equal(!!jaimeController.isDestroying, false, 'Retained objects\' containers are not cleaned up');
});

test('one cannot remove wrapped model directly when specifying `itemController`', function(assert) {
  createArrayController();
  var cerseiController = arrayController.objectAtContent(2);

  assert.equal(arrayController.get('length'), 3, 'precondition - array is in initial state');
  arrayController.removeObject(cersei);

  assert.equal(arrayController.get('length'), 3, 'cannot remove wrapped objects directly');

  run(function() {
    arrayController.removeObject(cerseiController);
  });
  assert.equal(arrayController.get('length'), 2, 'can remove wrapper objects');
});

test('when items are removed from the underlying array, their respective subcontainers are destroyed', function(assert) {
  createArrayController();
  var jaimeController = arrayController.objectAtContent(1);
  var cerseiController = arrayController.objectAtContent(2);
  get(arrayController, 'subContainers');

  assert.equal(!!jaimeController.isDestroying, false, 'precond - nobody is destroyed yet');
  assert.equal(!!cerseiController.isDestroying, false, 'precond - nobody is destroyed yet');

  run(function() {
    lannisters.removeObject(cersei); // if only it were that easy
  });

  assert.equal(!!jaimeController.isDestroyed, false, 'Retained objects\' containers are not cleaned up');
  assert.equal(!!cerseiController.isDestroyed, true, 'Removed objects\' containers are cleaned up');
});

test('`itemController` can be dynamic by overwriting `lookupItemController`', function(assert) {
  createDynamicArrayController();

  var tywinController = arrayController.objectAtContent(0);
  var jaimeController = arrayController.objectAtContent(1);

  assert.ok(controllerClass.detectInstance(tywinController), 'lookupItemController can return different classes for different objects');
  assert.ok(otherControllerClass.detectInstance(jaimeController), 'lookupItemController can return different classes for different objects');
});

test('when `idx` is out of range, `lookupItemController` is not called', function(assert) {
  arrayController = ArrayController.create({
    container: container,
    lookupItemController(object) {
      assert.ok(false, '`lookupItemController` should not be called when `idx` is out of range');
    },
    model: lannisters
  });

  assert.strictEqual(arrayController.objectAtContent(50), undefined, 'no controllers are created for indexes that are superior to the length');
  assert.strictEqual(arrayController.objectAtContent(-1), undefined, 'no controllers are created for indexes less than zero');
});

test('if `lookupItemController` returns a string, it must be resolvable by the container', function(assert) {
  arrayController = ArrayController.create({
    container: container,
    lookupItemController(object) {
      return 'NonExistent';
    },
    model: lannisters
  });

  assert.throws(function() { arrayController.objectAtContent(1); }, /NonExistent/, '`lookupItemController` must return either null or a valid controller name');
});

test('target and parentController are set to the concrete parentController', function(assert) {
  var parent = ArrayController.create({

  });

  // typically controller created for {{each itemController="foo"}}
  var virtual = ArrayController.create({
    itemController: 'Item',
    container: container,
    target: parent,
    parentController: parent,
    _isVirtual: true,
    model: Ember.A([
      { name: 'kris seldenator' }
    ])
  });

  var itemController = virtual.objectAtContent(0);

  assert.equal(itemController.get('parentController'), parent);
  assert.equal(itemController.get('target'), parent);

  run(function() {
    parent.destroy();
    virtual.destroy();
  });

});

test('array observers can invoke `objectAt` without overwriting existing item controllers', function(assert) {
  createArrayController();

  var tywinController = arrayController.objectAtContent(0);
  var arrayObserverCalled = false;

  arrayController.reopen({
    lannistersWillChange() { return this; },
    lannistersDidChange(_, idx, removedAmt, addedAmt) {
      arrayObserverCalled = true;
      assert.equal(this.objectAt(idx).get('model.name'), 'Tyrion', 'Array observers get the right object via `objectAt`');
    }
  });
  arrayController.addArrayObserver(arrayController, {
    willChange: 'lannistersWillChange',
    didChange: 'lannistersDidChange'
  });

  run(function() {
    lannisters.unshiftObject(tyrion);
  });

  assert.equal(arrayObserverCalled, true, 'Array observers are called normally');
  assert.equal(tywinController.get('model.name'), 'Tywin', 'Array observers calling `objectAt` does not overwrite existing controllers\' model');
});

test('`itemController`\'s life cycle should be entangled with its parent controller', function(assert) {
  createDynamicArrayController();

  var tywinController = arrayController.objectAtContent(0);
  var jaimeController = arrayController.objectAtContent(1);

  run(arrayController, 'destroy');

  assert.equal(tywinController.get('isDestroyed'), true);
  assert.equal(jaimeController.get('isDestroyed'), true);
});

module('Ember.ArrayController - itemController with arrayComputed', {
  setup() {
    registry = new Registry();
    container = registry.container();

    cersei = EmberObject.create({ name: 'Cersei' });
    jaime = EmberObject.create({ name: 'Jaime' });
    lannisters = Ember.A([jaime, cersei]);

    controllerClass = Controller.extend({
      title: computed(function () {
        switch (get(this, 'name')) {
          case 'Jaime':   return 'Kingsguard';
          case 'Cersei':  return 'Queen';
        }
      }).property('name'),

      toString() {
        return 'itemController for ' + this.get('name');
      }
    });

    registry.register('controller:Item', controllerClass);
  },
  teardown() {
    run(function() {
      container.destroy();
    });
  }
});

test('item controllers can be used to provide properties for array computed macros', function(assert) {
  createArrayController();

  assert.ok(compare(guidFor(cersei), guidFor(jaime)) < 0, 'precond - guid tiebreaker would fail test');

  arrayController.reopen({
    sortProperties: Ember.A(['title']),
    sorted: sort('@this', 'sortProperties')
  });

  var sortedNames = arrayController.get('sorted').mapBy('model.name');

  assert.deepEqual(sortedNames, ['Jaime', 'Cersei'], 'ArrayController items can be sorted on itemController properties');
});
