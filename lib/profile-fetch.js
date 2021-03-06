module.exports = profileFetch

var get = require('lodash/get')
var set = require('lodash/set')

var internals = module.exports.internals = {}
internals.fetchProperties = require('../utils/fetch-properties')

function profileFetch (state, path) {
  return state.ready

  .then(function () {
    return internals.fetchProperties({
      url: state.url + '/session/account/profile',
      sessionId: get(state, 'account.session.id'),
      path: path
    })
  })

  .then(function (properties) {
    if (typeof path === 'string') {
      set(state.account.profile, path, properties)
    } else {
      set(state.account, 'profile', properties)
    }

    state.cache.set(state.account)

    return properties
  })

  .catch(function (error) {
    if (error.statusCode === 401) {
      state.account.session.invalid = true
      state.emitter.emit('unauthenticate')

      state.cache.set(state.account)
    }

    throw error
  })
}
