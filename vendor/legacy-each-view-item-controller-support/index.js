if (Ember.ENV._ENABLE_LEGACY_VIEW_SUPPORT) {
  Ember._LegacyEachView.reopen({
    _arrayController: Ember.computed(function() {
      var itemController = this.getAttr('itemController');
      var controller = this.get('container').lookupFactory('controller:array').create({
        _isVirtual: true,
        parentController: this.get('controller'),
        itemController: itemController,
        target: this.get('controller'),
        _eachView: this,
        content: this.getAttr('content')
      });

      return controller;
    }),

    _willUpdate(attrs) {
      let itemController = this.getAttrFor(attrs, 'itemController');

      if (itemController) {
        let arrayController = this.get('_arrayController');
        arrayController.set('content', this.getAttrFor(attrs, 'content'));
      }
    },

    _arrangedContent: Ember.computed('attrs.content', function() {
      if (this.getAttr('itemController')) {
        return this.get('_arrayController');
      }

      return this.getAttr('content');
    })
  });
}
