'use strict';

let VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this);
    let emberVersion = checker.forEmber();

    this.shouldInclude = emberVersion.gte('2.0.0-beta.1');
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.shouldInclude) { return; }

    let config = this.project.config(process.env.EMBER_ENV);

    this.hasLegacyViewSupport = config.EmberENV._ENABLE_LEGACY_VIEW_SUPPORT;

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

  treeFor(name) {
    if (!this.shouldInclude) { return; }

    return this._super.treeFor.call(this, name);
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldInclude) { return; }

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
