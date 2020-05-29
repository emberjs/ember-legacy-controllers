import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('generated-object-controller-test');
  this.route('generated-array-controller-test');
});

export default Router;
