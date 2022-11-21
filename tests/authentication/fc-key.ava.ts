import anyTest, { TestFn } from 'ava';
const naj = require('near-api-js')
const js_sha256 = require("js-sha256")
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';
import { Wallet } from './auth.ava'

const test = anyTest as TestFn<{}>;
const NONCE = Uint8Array.from(Array(32).keys())

// The following tests use an account with the following properties:
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk

test('returns false with function call key', async (t) => {
  const wallet = new Wallet()
  wallet.privateKey = "ed25519:3zsuvDCiwT11GKV99K72ozYoda1WSDEZ8cS227UohZCrBCR1Q6FiENsytAqUpUHxmvUPjRovg24mVM2puWn8Js76"
  wallet.publicKey = "ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk"

  const { accountId, publicKey, signature } = await wallet.verifyOwner({ domain: "myapp.com", nonce: NONCE })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.false(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.true(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});