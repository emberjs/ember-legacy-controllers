import Ember from 'ember';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

if (Ember.ENV._ENABLE_LEGACY_VIEW_SUPPORT) {
  module('{{#each}} with item controller', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
      this.owner.register('controller:user', Controller.extend({
        fullName: computed('model.firstName', 'model.lastName', function() {
          return `${this.get('model.firstName')} ${this.get('model.lastName')}`;
        })
      }));

      this.set('users', Ember.A([
        { firstName: 'Matthew', lastName: 'Beale' },
        { firstName: 'Miguel', lastName: 'Camba' },
        { firstName: 'Stefan', lastName: 'Penner' }
      ]));
      
      await render(hbs`
        <ul>
          {{#each users itemController="user" as |user|}}
            <li>{{user.fullName}}</li>
          {{/each}}
        </ul>
      `);

      assert.deepEqual(
        assert.dom('li').findElements().map(element => element.textContent),
        ['Matthew Beale', 'Miguel Camba', 'Stefan Penner']
      );

      this.set('users', Ember.A([
        { firstName: 'Robert', lastName: 'Jackson' },
        { firstName: 'Martin', lastName: 'Muñoz' }
      ]));

      assert.deepEqual(
        assert.dom('li').findElements().map(element => element.textContent),
        ['Robert Jackson', 'Martin Muñoz']
      );
    });
  });
}
