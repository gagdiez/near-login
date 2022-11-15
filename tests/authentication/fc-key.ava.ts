import anyTest, { TestFn } from 'ava';
const naj = require('near-api-js')
const js_sha256 = require("js-sha256")
import { authenticate, verifyBlockIsOneMinOld, verifyExpectedMessage, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';

import { JsonRpcProvider } from 'near-api-js/lib/providers';

const test = anyTest as TestFn<{}>;


test('returns false with function call key', async (t) => {
  const { accountId, publicKey, message, blockId, signature } = await signMessage({ message: "myapp.com" })
  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.false(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.true(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)
});

async function signMessage({ message }: { message: string }): Promise<AuthenticationToken> {
  // sign a message using a function call key for the user
  const accountId = "dev-1659223306990-29456453680390"
  const privateKey = "ed25519:3zsuvDCiwT11GKV99K72ozYoda1WSDEZ8cS227UohZCrBCR1Q6FiENsytAqUpUHxmvUPjRovg24mVM2puWn8Js76"
  const publicKey = "ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk"

  const Key = naj.utils.KeyPair.fromString(privateKey)

  // Get blockId from testnet
  const provider = new JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  const block = await provider.block({ finality: 'final' });
  const blockId = block.header.hash

  // Create the payload and sign it
  const payload: Payload = { accountId, message, blockId, publicKey }
  const strPayload = JSON.stringify(payload)
  const hashedPayload = js_sha256.sha256.array(strPayload)
  const { signature } = Key.sign(Uint8Array.from(hashedPayload))

  // Return the AuthenticationToken
  return { accountId, blockId, message, publicKey, signature }
}

class AuthenticationToken {
  accountId: string; // The account name as plain text (e.g. "alice.near")
  message: string; // The same message passed in `VerifyOwnerParams.message` 
  blockId: string; // The hash of a block created close to the time of signature
  publicKey: string; // The public counterpart of the key used to sign, expressed as a string with format "<key-type>:<base-64-key-bytes>"
  signature: string; // The base64 representation of the signature.
}

class Payload {
  accountId: string; // Mandatory: the account name as plain text (e.g. "alice.near")
  message: string; // The same message passed in `VerifyOwnerParams.message` 
  blockId: string; // The hash of a block created close to the time of signature
  publicKey: string; // public counterpart of the key used to sign, encoded as a string with format "<key-type>:<base-64-key-bytes>"
}