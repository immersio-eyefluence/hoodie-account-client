module.exports = updateProfile

var clone = require('lodash/clone')
var merge = require('lodash/merge')

var Promise = require('lie')

var internals = module.exports.internals = {}
internals.request = require('../utils/request')
internals.serialise = require('../utils/serialise')

function updateProfile (state, options) {
  if (!options) {
    return Promise.reject(new Error('Please specify a profile property to update or add.'))
  }

  return state.ready

  .then(function () {
    return internals.request({
      method: 'PATCH',
      url: state.url + '/session/account/profile',
      headers: {
        authorization: 'Session ' + state.account.session.id
      },
      body: internals.serialise('profile', options, state.account.id + '-profile')
    })
  })

  .then(function () {
    if (!state.account.profile) {
      state.account.profile = {}
    }

    merge(state.account.profile, options)
    state.cache.set(state.account)

    state.emitter.emit('update', clone(state.account))

    return state.account.profile
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
