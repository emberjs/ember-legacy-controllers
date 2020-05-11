'use strict';

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.hasLegacyViewSupport = this.project.config(process.env.EMBER_ENV).EmberENV._ENABLE_LEGACY_VIEW_SUPPORT;
  },

  included() {
    this._super.included.apply(this, arguments);

    if (this.hasLegacyViewSupport) {
      // grab the original _findHost, before ember-engines can muck with it
      let proto = Object.getPrototypeOf(this);
      let host = proto._findHost.call(this);
  
      // using `app.import` here because we need to ensure this ends up in the
      // top level vendor.js (not engine-vendor.js as would happen with
      // this.import inside an engine)
      host.import('vendor/legacy-each-view-item-controller-support/index.js');
    }
  },

  treeForVendor(rawVendorTree) {
    if (this.hasLegacyViewSupport) {
      let babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');

      let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
        babel: this.options.babel,

        'ember-cli-babel': {
          compileModules: false,
        },
      });

      return transpiledVendorTree;
    }
  },
};
