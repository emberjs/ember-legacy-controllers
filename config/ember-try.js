'use strict';

module.exports = async function() {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-1.13-without-ember-legacy-views',
        bower: {
          ember: '1.13.13'
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
        name: 'ember-2.5-without-ember-legacy-views',
        bower: {
          ember: '2.5.1'
        }
      },
      {
        name: 'ember-2.5-with-ember-legacy-views',
        bower: {
          ember: '2.5.1'
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
