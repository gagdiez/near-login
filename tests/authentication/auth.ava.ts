import anyTest, { TestFn } from 'ava';
const js_sha256 = require("js-sha256")
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';
import { KeyPair } from 'near-api-js';

const test = anyTest as TestFn<{}>;

// The following tests use an account with the following properties:
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk

export const NONCE: number[] = Array.from(Array(32).keys())

test('authenticates user', async (t) => {
  const wallet = new Wallet()
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: "hi", receiver: "myapp.com", nonce: NONCE })

  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.true(await verifySignature({ publicKey, signature }))
  t.true(authenticated)
});

// Define a Wallet that implements NEP413

export class SignedMessage {
  accountId: string; // The account name as plain text (e.g. "alice.near")
  publicKey: string; // The public counterpart of the key used to sign, expressed as a string with format "<key-type>:<base-64-key-bytes>"
  signature: string; // The base64 representation of the signature.
}

export class Payload {
  message: string; // The same message passed in `SignedMessage.message`
  receiver: string; // The same message passed in `SignedMessage.receiver`
  nonce: number[]; // The same nonce passed in `SignedMessage.message` 
}

export class Wallet {
  // Emulate having a user stored in the wallet, TODO: Create it using near-api-js
  accountId = "dev-1659223306990-29456453680390"
  privateKey = "ed25519:2NoJqvZkgsAwm7kigB4QbwiQtdeK7xdBNQvvZ82qeYgMvguuTuggFKjFfaAcHiuidHQEuUmSU2RAQcNCRutUJbzH"
  publicKey = "ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB"

  // implementation following NEP413
  async signMessage({ message, receiver, nonce }: { message: string, receiver: string, nonce: number[] }): Promise<SignedMessage> {
    const Key = KeyPair.fromString(this.privateKey)

    // Create the payload and sign it
    const payload: Payload = { message, receiver, nonce }
    const hashedPayload = js_sha256.sha256.array(`NEP0413:` + JSON.stringify(payload))
    const { signature } = Key.sign(Uint8Array.from(hashedPayload))
    const encoded: string = Buffer.from(signature).toString('base64')

    // Return the AuthenticationToken
    return { accountId: this.accountId, publicKey: this.publicKey, signature: encoded }
  }
}