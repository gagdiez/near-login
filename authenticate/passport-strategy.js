// Passport simplifies handling the sign in token
passportCustom = require('passport-custom');
walletAuth = require('./wallet-authenticate')

async function verify(req, callback){
  const authenticated = await walletAuth.authenticate(req.query)

  if(authenticated){
    return callback(null, req.query.accountId)
  }else{
    return callback(null, false)
  }
}

class NearProtocolStrategy extends passportCustom.Strategy{
  constructor(){
    super(verify)
  }  
}

let auth = {}
auth.Strategy = NearProtocolStrategy
auth.serializeUser = () => {return function(user, callback){callback(null, user)}}
auth.deserializeUser = () => {return function(id, callback){callback(null, id)}}
module.exports = auth;