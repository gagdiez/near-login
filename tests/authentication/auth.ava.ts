import anyTest, { TestFn } from 'ava';
const js_sha256 = require("js-sha256")
import { authenticate, verifyBlockIsOneMinOld, verifyExpectedMessage, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { KeyPair } from 'near-api-js';

const test = anyTest as TestFn<{}>;

// The following tests use an account with the following properties:
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk

test('authenticates user', async (t) => {
  const { accountId, message, publicKey, blockId, signature } = await verifyOwner({ message: "myapp.com" })

  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.true(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.true(authenticated)
});

// verifyOwner implementation following NEP413
async function verifyOwner({ message }: { message: string }): Promise<AuthenticationToken> {
  // Emulate having a user stored in the wallet, TODO: Create it using near-api-js
  const accountId = "dev-1659223306990-29456453680390"
  const privateKey = "ed25519:2NoJqvZkgsAwm7kigB4QbwiQtdeK7xdBNQvvZ82qeYgMvguuTuggFKjFfaAcHiuidHQEuUmSU2RAQcNCRutUJbzH"
  const publicKey = "ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB"

  const Key = KeyPair.fromString(privateKey)

  // Get blockId from testnet
  const provider = new JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  const block = await provider.block({ finality: 'final' });
  const blockId = block.header.hash

  // Create the payload and sign it
  const payload: Payload = { accountId, message, blockId, publicKey }
  const strPayload = JSON.stringify(payload)
  const hashedPayload = js_sha256.sha256.array(strPayload)
  const { signature } = Key.sign(Uint8Array.from(hashedPayload))
  const encoded: string = Buffer.from(signature).toString('base64')

  // Return the AuthenticationToken
  return { accountId, blockId, message, publicKey, signature: encoded }
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