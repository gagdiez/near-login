const naj = require('near-api-js')
const js_sha256 = require("js-sha256")
const borsh = require("borsh")

async function authenticate({ accountId, message, blockId, publicKey, signature }) {
  // A user is correctly authenticated if:
  // - It was made less than a minute ago
  // - It signed the correct message
  // - The key used to sign belongs to the user and is a Full Access Key
  const block_is_one_min_old = await verifyBlockIsOneMinOld({ blockId })
  const valid_signature = verifySignature({ accountId, message, blockId, publicKey, signature })
  const full_key_of_user = await verifyFullKeyBelongsToUser({ accountId, publicKey })

  return block_is_one_min_old && valid_signature && full_key_of_user
}

async function verifyBlockIsOneMinOld({blockId}){
  const block_timestamp = await fetch_block_timestamp({blockId})
  const ONE_MINUTE = 60000
  return Date.now() - block_timestamp < ONE_MINUTE
}

function verifySignature({ message, publicKey, blockId, accountId, signature }) {
  // Reconstruct PublicKey from the parameters given in the URL
  const data = Buffer.from(publicKey, 'base64')
  const myPK = new naj.utils.PublicKey({ data, keyType: 0 })

  // Reconstruct the message that was **actually signed**
  let msg = JSON.stringify({ accountId, message, blockId, publicKey, keyType: 0 })
  const hashed_message = Uint8Array.from(js_sha256.sha256.array(msg))

  // Reconstruct the signature from the parameter given in the URL
  let real_signature = Buffer.from(signature, 'base64')

  // Use the public Key to verify that the private-counterpart signed the message
  return myPK.verify(hashed_message, real_signature)
}

async function verifyFullKeyBelongsToUser({ publicKey, accountId }) {
  // Reconstruct Public Key from the URL
  const pkData = Buffer.from(publicKey, 'base64')
  const userPK = 'ed25519:' + borsh.baseEncode(pkData)

  // Call the public RPC asking for all the users' keys
  let data = await fetch_all_user_keys({ accountId })

  // if there are no keys, then the user could not sign it!
  if (!data || !data.result || !data.result.keys) return false

  // check all the keys to see if we find the used_key there
  for (const k in data.result.keys) {
    if (data.result.keys[k].public_key === userPK) {
      // Ensure the key is full access, meaning the user had to sign
      // the transaction through the wallet
      return data.result.keys[k].access_key.permission == "FullAccess"
    }
  }
  
  return false // didn't find it
}

// Aux method
async function fetch_all_user_keys({ accountId }) {
  const keys = await fetch(
    "https://rpc.testnet.near.org",
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: `{"jsonrpc":"2.0", "method":"query", "params":["access_key/${accountId}", ""], "id":1}`
    }).then(data => data.json()).then(result => result)
  return keys
}

async function fetch_block_timestamp({ blockId }) {
  return await fetch(
    "https://rpc.testnet.near.org",
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: `{"jsonrpc":"2.0", "method": "block", "params":{"block_id": "${blockId}"}, "id":1}`
    }
  ).then(data => data.json()).then(result => result.result.header.timestamp / 10**6)
}

module.exports = { authenticate };
