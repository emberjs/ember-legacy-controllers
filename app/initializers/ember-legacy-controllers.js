import Ember from 'ember';

const { get, set, computed } = Ember;

export default {
  name: 'ember-legacy-controllers',
  initialize: function() {
    /**
      Adds support for ArrayController in the legacy {{each}} helper
    */
    Ember._LegacyEachView.reopen({
      _arrayController: computed(function() {
        var itemController = this.getAttr('itemController');
        var controller = get(this, 'container').lookupFactory('controller:array').create({
          _isVirtual: true,
          parentController: get(this, 'controller'),
          itemController: itemController,
          target: get(this, 'controller'),
          _eachView: this,
          content: this.getAttr('content')
        });

        return controller;
      }),

      _willUpdate(attrs) {
        let itemController = this.getAttrFor(attrs, 'itemController');

        if (itemController) {
          let arrayController = get(this, '_arrayController');
          set(arrayController, 'content', this.getAttrFor(attrs, 'content'));
        }
      }
    });

  }
};
