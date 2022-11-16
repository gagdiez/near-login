import anyTest, { TestFn } from 'ava';
const naj = require('near-api-js')
const js_sha256 = require("js-sha256")
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';

const test = anyTest as TestFn<{}>;


test('returns false with function call key', async (t) => {
  const { accountId, publicKey, signature } = await signMessage({ domain: "myapp.com", message: "hi" })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.false(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.true(await verifySignature({publicKey, accountId, signature}))
  t.false(authenticated)
});

async function signMessage({ domain, message }: { domain: string, message: string }): Promise<AuthenticationToken> {
  // sign a message using a function call key for the user
  const accountId = "dev-1659223306990-29456453680390"
  const privateKey = "ed25519:3zsuvDCiwT11GKV99K72ozYoda1WSDEZ8cS227UohZCrBCR1Q6FiENsytAqUpUHxmvUPjRovg24mVM2puWn8Js76"
  const publicKey = "ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk"

  const Key = naj.utils.KeyPair.fromString(privateKey)

  // Create the payload and sign it
  const payload: Payload = { accountId, domain, message, publicKey }
  const strPayload = JSON.stringify(payload)
  const hashedPayload = js_sha256.sha256.array(strPayload)
  const { signature } = Key.sign(Uint8Array.from(hashedPayload))

  // Return the AuthenticationToken
  return { accountId, publicKey, signature }
}

class AuthenticationToken {
  accountId: string; // The account name as plain text (e.g. "alice.near")
  publicKey: string; // The public counterpart of the key used to sign, expressed as a string with format "<key-type>:<base-64-key-bytes>"
  signature: string; // The base64 representation of the signature.
}

class Payload {
  accountId: string; // Mandatory: the account name as plain text (e.g. "alice.near")
  domain: string; // The app domain's
  message: string; // The same message passed in `VerifyOwnerParams.message` 
  publicKey: string; // public counterpart of the key used to sign, encoded as a string with format "<key-type>:<base-64-key-bytes>"
}