import Ember from 'ember';

export default function beforeObserver(...args) {
  var func  = args.slice(-1)[0];
  var paths;

  var addWatchedProperty = function(path) { paths.push(path); };

  var _paths = args.slice(0, -1);

  if (typeof func !== 'function') {
    // revert to old, soft-deprecated argument ordering

    func  = args[0];
    _paths = args.slice(1);
  }

  paths = [];

  for (var i = 0; i < _paths.length; ++i) {
    Ember.expandProperties(_paths[i], addWatchedProperty);
  }

  if (typeof func !== 'function') {
    throw new Ember.Error('Ember.beforeObserver called without a function');
  }

  func.__ember_observesBefore__ = paths;
  return func;
}
