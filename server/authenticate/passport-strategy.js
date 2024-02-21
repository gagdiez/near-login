// Passport simplifies handling the sign in token
const { Strategy } = require('passport-custom');
const { authenticate } = require('./wallet-authenticate')

async function verify(req, callback) {
  const authenticated = await authenticate(req.body)
  if (authenticated) {
    return callback(null, req.body.accountId)
  } else {
    return callback(null, false)
  }
}

class NearProtocolStrategy extends Strategy {
  constructor(req, callback) {
    super(verify)
  }
}

let auth = {}
auth.Strategy = NearProtocolStrategy
auth.serializeUser = (user, callback) => { callback(null, { id: user }) };
auth.deserializeUser = (id, callback) => { callback(null, id) };
module.exports = auth;