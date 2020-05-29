import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';

module('Generated controllers', function(hooks) {
  setupApplicationTest(hooks);

  test('object controllers are generated correctly', async function(assert) {
    await visit('/generated-object-controller-test');
    assert.dom('[data-test-target]').hasText('Alice');
  });

  test('array controllers are generated correctly', async function(assert) {
    await visit('/generated-array-controller-test');
    assert.dom('[data-test-target]').hasText('Alice');
  });
});
