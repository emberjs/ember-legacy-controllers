import Ember from 'ember';
import { get } from '@ember/object';

function generateControllerFactory(owner, controllerName, context) {
  let controllerType;

  if (context && Array.isArray(context)) {
    controllerType = 'array';
  } else if (context) {
    controllerType = 'object';
  } else {
    controllerType = 'basic';
  }

  let factoryName = `controller:${controllerType}`;

  let Factory = owner._lookupFactory(factoryName).extend({
    isGenerated: true,
    toString() {
      return `(generated ${controllerName} controller)`;
    }
  });

  let fullName = `controller:${controllerName}`;

  owner.register(fullName, Factory);

  return Factory;
}

function generateController(owner, controllerName, context) {
  generateControllerFactory(owner, controllerName, context);
  let fullName = `controller:${controllerName}`;
  let instance = owner.lookup(fullName);

  if (get(instance, 'namespace.LOG_ACTIVE_GENERATION')) {
    Ember.Logger.info(`generated -> ${fullName}`, { fullName: fullName });
  }

  return instance;
}

// Patch Ember's internal modules
let generateControllerModule = Ember.__loader.require('ember-routing/system/generate_controller');
generateControllerModule.generateControllerFactory = generateControllerFactory;
generateControllerModule.default = generateController;
