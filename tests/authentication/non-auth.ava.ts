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

test('if the signed message is wrong it returns false', async (t) => {
  const { accountId, message, publicKey, blockId, signature } = await verifyOwner({ message: "myappo.com" })
  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.false(await verifyExpectedMessage({message}))
  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.true(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the accountId is different it returns false', async (t) => {
  const { message, publicKey, blockId, signature } = await verifyOwner({ message: "myapp.com" })
  const accountId = "dev-1659223306990-29456453680391"
  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.false(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the publicKey is different it returns false', async (t) => {
  const { message, accountId, blockId, signature } = await verifyOwner({ message: "myapp.com" })
  const publicKey = "ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye"
  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the blockId is different it returns false', async (t) => {
  const { message, accountId, publicKey, signature } = await verifyOwner({ message: "myapp.com" })

  // Get another block from testnet
  const provider = new JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  const block = await provider.block({ finality: 'optimistic' });
  const blockId = block.header.hash

  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.true(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.false(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)
});

test('if the blockId is too old it returns false', async (t) => {
  const accountId = 'dev-1659223306990-29456453680390'
  const message = 'myapp.com'
  const publicKey = 'ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB'
  const blockId = 'GPBRgtaTc1oxapJTxszFdKG6EAtdgqGJXp1dXQK8fYBS'
  const signature = Uint8Array.from([
    247, 70, 131, 217, 162, 162, 52, 234, 208, 85, 189, 137,
    136, 6, 60, 103, 193, 184, 146, 190, 167, 4, 81, 78,
    24, 7, 79, 133, 0, 117, 97, 153, 218, 94, 23, 246,
    223, 2, 3, 111, 26, 161, 229, 6, 34, 73, 158, 131,
    78, 20, 153, 70, 207, 8, 116, 172, 51, 251, 53, 5,
    162, 5, 222, 10
  ])

  const authenticated = await authenticate({ accountId, message, publicKey, blockId, signature })

  t.false(await verifyBlockIsOneMinOld({blockId}))
  t.true(await verifyExpectedMessage({message}))
  t.true(await verifyFullKeyBelongsToUser({publicKey, accountId}))
  t.true(await verifySignature({message, blockId, publicKey, accountId, signature}))
  t.false(authenticated)}
);


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