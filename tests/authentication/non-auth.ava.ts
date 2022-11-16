import anyTest, { TestFn } from 'ava';
const js_sha256 = require("js-sha256")
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { KeyPair } from 'near-api-js';

const test = anyTest as TestFn<{}>;

// The following tests use an account with the following properties:
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk

test('if the domain is wrong it returns false', async (t) => {
  const { accountId,publicKey, signature } = await verifyOwner({ domain: "myappo.com", message: "hi" })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the message is wrong it returns false', async (t) => {
  const { accountId,publicKey, signature } = await verifyOwner({ domain: "myapp.com", message: "howdy" })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the accountId is different it returns false', async (t) => {
  const { publicKey, signature } = await verifyOwner({ domain: "myapp.com", message: "hi" })
  const accountId = "dev-1659223306990-29456453680391"
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.false(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the publicKey is different it returns false', async (t) => {
  const { accountId, signature } = await verifyOwner({ domain: "myapp.com", message: "hi" })
  const publicKey = "ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye"
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({publicKey, accountId, signature}))
  t.false(authenticated)
});

// verifyOwner implementation following NEP413
async function verifyOwner({ domain, message }: { domain: string, message: string }): Promise<AuthenticationToken> {
  // Emulate having a user stored in the wallet, TODO: Create it using near-api-js
  const accountId = "dev-1659223306990-29456453680390"
  const privateKey = "ed25519:2NoJqvZkgsAwm7kigB4QbwiQtdeK7xdBNQvvZ82qeYgMvguuTuggFKjFfaAcHiuidHQEuUmSU2RAQcNCRutUJbzH"
  const publicKey = "ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB"

  const Key = KeyPair.fromString(privateKey)

  // Create the payload and sign it
  const payload: Payload = { accountId, domain, message,publicKey }
  const strPayload = JSON.stringify(payload)
  const hashedPayload = js_sha256.sha256.array(strPayload)
  const { signature } = Key.sign(Uint8Array.from(hashedPayload))
  const encoded: string = Buffer.from(signature).toString('base64')

  // Return the AuthenticationToken
  return { accountId, publicKey, signature: encoded }
}

class AuthenticationToken {
  accountId: string; // The account name as plain text (e.g. "alice.near")
  publicKey: string; // The public counterpart of the key used to sign, expressed as a string with format "<key-type>:<base-64-key-bytes>"
  signature: string; // The base64 representation of the signature.
}

class Payload {
  accountId: string; // Mandatory: the account name as plain text (e.g. "alice.near")
  domain: string; // The app's domain
  message: string; // The same message passed in `VerifyOwnerParams.message` 
  publicKey: string; // public counterpart of the key used to sign, encoded as a string with format "<key-type>:<base-64-key-bytes>"
}