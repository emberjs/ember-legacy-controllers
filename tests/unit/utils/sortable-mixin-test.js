import Ember from 'ember';
import { module, test } from 'qunit';
import SortableMixin from 'ember-proxy-controllers/utils/sortable-mixin';

const {
  set,
  run,
  listenersFor,
  observer: emberObserver,
  ArrayProxy,
  Object: EmberObject
} = Ember;

var unsortedArray, sortedArrayProxy;

module('Ember.Sortable');

module('Ember.Sortable with content', {
  setup() {
    run(function() {
      var array = [{ id: 1, name: 'Scumbag Dale' }, { id: 2, name: 'Scumbag Katz' }, { id: 3, name: 'Scumbag Bryn' }];

      unsortedArray = Ember.A(Ember.A(array).copy());

      sortedArrayProxy = ArrayProxy.extend(SortableMixin).create({
        content: unsortedArray
      });
    });
  },

  teardown() {
    run(function() {
      sortedArrayProxy.set('content', null);
      sortedArrayProxy.destroy();
    });
  }
});

test('if you do not specify `sortProperties` sortable have no effect', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Dale', 'array is in it natural order');

  unsortedArray.pushObject({ id: 4, name: 'Scumbag Chavard' });

  assert.equal(sortedArrayProxy.get('length'), 4, 'array has 4 items');
  assert.equal(sortedArrayProxy.objectAt(3).name, 'Scumbag Chavard', 'a new object was inserted in the natural order');

  sortedArrayProxy.set('sortProperties', []);
  unsortedArray.pushObject({ id: 5, name: 'Scumbag Jackson' });

  assert.equal(sortedArrayProxy.get('length'), 5, 'array has 5 items');
  assert.equal(sortedArrayProxy.objectAt(4).name, 'Scumbag Jackson', 'a new object was inserted in the natural order with empty array as sortProperties');
});

test('you can change sorted properties', function(assert) {
  sortedArrayProxy.set('sortProperties', ['id']);

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Dale', 'array is sorted by id');
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  sortedArrayProxy.set('sortAscending', false);

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Bryn', 'array is sorted by id in DESC order');
  assert.equal(sortedArrayProxy.objectAt(2).name, 'Scumbag Dale', 'array is sorted by id in DESC order');
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  sortedArrayProxy.set('sortProperties', ['name']);

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Katz', 'array is sorted by name in DESC order');
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
});

test('changing sort order triggers observers', function(assert) {
  var observer;
  var changeCount = 0;
  observer = EmberObject.extend({
    arrangedDidChange: emberObserver('array.[]', function() {
      changeCount++;
    })
  }).create({
    array: sortedArrayProxy
  });

  assert.equal(changeCount, 0, 'precond - changeCount starts at 0');

  sortedArrayProxy.set('sortProperties', ['id']);

  assert.equal(changeCount, 1, 'setting sortProperties increments changeCount');

  sortedArrayProxy.set('sortAscending', false);

  assert.equal(changeCount, 2, 'changing sortAscending increments changeCount');

  sortedArrayProxy.set('sortAscending', true);

  assert.equal(changeCount, 3, 'changing sortAscending again increments changeCount');

  run(function() { observer.destroy(); });
});

test('changing sortProperties and sortAscending with setProperties, sortProperties appearing first', function(assert) {
  sortedArrayProxy.set('sortProperties', ['name']);
  sortedArrayProxy.set('sortAscending', false);

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Katz', 'array is sorted by name in DESC order');
  assert.equal(sortedArrayProxy.objectAt(2).name, 'Scumbag Bryn', 'array is sorted by name in DESC order');

  sortedArrayProxy.setProperties({ sortProperties: ['id'], sortAscending: true });

  assert.equal(sortedArrayProxy.objectAt(0).id, 1, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 3, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortProperties: ['name'], sortAscending: false });

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Katz', 'array is sorted by name in DESC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).name, 'Scumbag Bryn', 'array is sorted by name in DESC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortProperties: ['id'], sortAscending: false });

  assert.equal(sortedArrayProxy.objectAt(0).id, 3, 'array is sorted by id in DESC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 1, 'array is sorted by id in DESC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortProperties: ['id'], sortAscending: true });

  assert.equal(sortedArrayProxy.objectAt(0).id, 1, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 3, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');

});

test('changing sortProperties and sortAscending with setProperties, sortAscending appearing first', function(assert) {
  sortedArrayProxy.set('sortProperties', ['name']);
  sortedArrayProxy.set('sortAscending', false);

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Katz', 'array is sorted by name in DESC order');
  assert.equal(sortedArrayProxy.objectAt(2).name, 'Scumbag Bryn', 'array is sorted by name in DESC order');

  sortedArrayProxy.setProperties({ sortAscending: true, sortProperties: ['id'] });

  assert.equal(sortedArrayProxy.objectAt(0).id, 1, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 3, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortAscending: false, sortProperties: ['name'] });

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Katz', 'array is sorted by name in DESC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).name, 'Scumbag Bryn', 'array is sorted by name in DESC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortAscending: false, sortProperties: ['id'] });

  assert.equal(sortedArrayProxy.objectAt(0).id, 3, 'array is sorted by id in DESC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 1, 'array is sorted by id in DESC order after setting sortAscending and sortProperties');

  sortedArrayProxy.setProperties({ sortAscending: true, sortProperties: ['id'] });

  assert.equal(sortedArrayProxy.objectAt(0).id, 1, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');
  assert.equal(sortedArrayProxy.objectAt(2).id, 3, 'array is sorted by id in ASC order after setting sortAscending and sortProperties');

});

module('Ember.Sortable with content and sortProperties', {
  setup() {
    run(function() {
      var array = [{ id: 1, name: 'Scumbag Dale' }, { id: 2, name: 'Scumbag Katz' }, { id: 3, name: 'Scumbag Bryn' }];

      unsortedArray = Ember.A(Ember.A(array).copy());

      sortedArrayProxy = ArrayProxy.extend(SortableMixin, {
        sortProperties: ['name']
      }).create({ content: unsortedArray });
    });
  },

  teardown() {
    run(function() {
      sortedArrayProxy.destroy();
    });
  }
});

test('sortable object will expose associated content in the right order', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Bryn', 'array is sorted by name');
});

test('you can add objects in sorted order', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  unsortedArray.pushObject({ id: 4, name: 'Scumbag Chavard' });

  assert.equal(sortedArrayProxy.get('length'), 4, 'array has 4 items');
  assert.equal(sortedArrayProxy.objectAt(1).name, 'Scumbag Chavard', 'a new object added to content was inserted according to given constraint');

  sortedArrayProxy.addObject({ id: 5, name: 'Scumbag Fucs' });

  assert.equal(sortedArrayProxy.get('length'), 5, 'array has 5 items');
  assert.equal(sortedArrayProxy.objectAt(3).name, 'Scumbag Fucs', 'a new object added to controller was inserted according to given constraint');
});

test('you can push objects in sorted order', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  unsortedArray.pushObject({ id: 4, name: 'Scumbag Chavard' });

  assert.equal(sortedArrayProxy.get('length'), 4, 'array has 4 items');
  assert.equal(sortedArrayProxy.objectAt(1).name, 'Scumbag Chavard', 'a new object added to content was inserted according to given constraint');

  sortedArrayProxy.pushObject({ id: 5, name: 'Scumbag Fucs' });

  assert.equal(sortedArrayProxy.get('length'), 5, 'array has 5 items');
  assert.equal(sortedArrayProxy.objectAt(3).name, 'Scumbag Fucs', 'a new object added to controller was inserted according to given constraint');
});

test('you can unshift objects in sorted order', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  unsortedArray.unshiftObject({ id: 4, name: 'Scumbag Chavard' });

  assert.equal(sortedArrayProxy.get('length'), 4, 'array has 4 items');
  assert.equal(sortedArrayProxy.objectAt(1).name, 'Scumbag Chavard', 'a new object added to content was inserted according to given constraint');

  sortedArrayProxy.addObject({ id: 5, name: 'Scumbag Fucs' });

  assert.equal(sortedArrayProxy.get('length'), 5, 'array has 5 items');
  assert.equal(sortedArrayProxy.objectAt(3).name, 'Scumbag Fucs', 'a new object added to controller was inserted according to given constraint');
});

test('addObject does not insert duplicates', function(assert) {
  var sortedArrayProxy;
  var obj = {};
  sortedArrayProxy = ArrayProxy.extend(SortableMixin).create({
    content: Ember.A([obj])
  });

  assert.equal(sortedArrayProxy.get('length'), 1, 'array has 1 item');

  sortedArrayProxy.addObject(obj);

  assert.equal(sortedArrayProxy.get('length'), 1, 'array still has 1 item');
});

test('you can change a sort property and the content will rearrange', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Bryn', 'bryn is first');

  set(sortedArrayProxy.objectAt(0), 'name', 'Scumbag Fucs');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Dale', 'dale is first now');
  assert.equal(sortedArrayProxy.objectAt(1).name, 'Scumbag Fucs', 'foucs is second');
});

test('you can change the position of the middle item', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');

  assert.equal(sortedArrayProxy.objectAt(1).name, 'Scumbag Dale', 'Dale is second');
  set(sortedArrayProxy.objectAt(1), 'name', 'Alice'); // Change Dale to Alice

  assert.equal(sortedArrayProxy.objectAt(0).name, 'Alice', 'Alice (previously Dale) is first now');
});

test('don\'t remove and insert if position didn\'t change', function(assert) {
  var insertItemSortedCalled = false;

  sortedArrayProxy.reopen({
    insertItemSorted(item) {
      insertItemSortedCalled = true;
      this._super(item);
    }
  });

  sortedArrayProxy.set('sortProperties', ['name']);

  set(sortedArrayProxy.objectAt(0), 'name', 'Scumbag Brynjolfsson');

  assert.ok(!insertItemSortedCalled, 'insertItemSorted should not have been called');
});

test('sortProperties observers removed on content removal', function(assert) {
  var removedObject = unsortedArray.objectAt(2);
  assert.equal(listenersFor(removedObject, 'name:change').length, 1,
    'Before removal, there should be one listener for sortProperty change.');
  unsortedArray.replace(2, 1, []);
  assert.equal(listenersFor(removedObject, 'name:change').length, 0,
    'After removal, there should be no listeners for sortProperty change.');
});

module('Ember.Sortable with sortProperties', {
  setup() {
    run(function() {
      sortedArrayProxy = ArrayProxy.extend(SortableMixin, {
        sortProperties: ['name']
      }).create();
      var array = [{ id: 1, name: 'Scumbag Dale' }, { id: 2, name: 'Scumbag Katz' }, { id: 3, name: 'Scumbag Bryn' }];
      unsortedArray = Ember.A(Ember.A(array).copy());
    });
  },

  teardown() {
    run(function() {
      sortedArrayProxy.destroy();
    });
  }
});

test('you can set content later and it will be sorted', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 0, 'array has 0 items');

  run(function() {
    sortedArrayProxy.set('content', unsortedArray);
  });

  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag Bryn', 'array is sorted by name');
});

module('Ember.Sortable with sortFunction and sortProperties', {
  setup() {
    run(function() {
      sortedArrayProxy = ArrayProxy.extend(SortableMixin, {
        sortProperties: ['name'],
        sortFunction(v, w) {
          var lowerV = v.toLowerCase();
          var lowerW = w.toLowerCase();

          if (lowerV < lowerW) {
            return -1;
          }
          if (lowerV > lowerW) {
            return 1;
          }
          return 0;
        }
      }).create();
      var array = [{ id: 1, name: 'Scumbag Dale' },
                   { id: 2, name: 'Scumbag Katz' },
                   { id: 3, name: 'Scumbag bryn' }];
      unsortedArray = Ember.A(Ember.A(array).copy());
    });
  },

  teardown() {
    run(function() {
      sortedArrayProxy.destroy();
    });
  }
});

test('you can sort with custom sorting function', function(assert) {
  assert.equal(sortedArrayProxy.get('length'), 0, 'array has 0 items');

  run(function() {
    sortedArrayProxy.set('content', unsortedArray);
  });

  assert.equal(sortedArrayProxy.get('length'), 3, 'array has 3 items');
  assert.equal(sortedArrayProxy.objectAt(0).name, 'Scumbag bryn', 'array is sorted by custom sort');
});
