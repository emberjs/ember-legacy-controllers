'use strict';

module.exports = async function() {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-1.13-without-ember-legacy-views',
        bower: {
          ember: '1.13.13'
        },
        npm: {
          devDependencies: {
            'ember-legacy-views': null
          }
        }
      },
      {
        name: 'ember-1.13-with-ember-legacy-views',
        bower: {
          ember: '1.13.13'
        },
        npm: {
          devDependencies: {
            'ember-legacy-views': '0.2.0'
          }
        }
      },
      {
        name: 'ember-2.4-without-ember-legacy-views',
        bower: {
          ember: '2.4.6'
        },
        npm: {
          devDependencies: {
            'ember-legacy-views': null
          }
        }
      },
      {
        name: 'ember-2.4-with-ember-legacy-views',
        bower: {
          ember: '2.4.6'
        },
        npm: {
          devDependencies: {
            'ember-legacy-views': '0.2.0'
          }
        }
      }
    ]
  };
};
