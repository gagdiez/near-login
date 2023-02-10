import anyTest, { TestFn } from 'ava';
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../../authenticate/wallet-authenticate';
import { Wallet } from './wallet';
import { MESSAGE, APP, CHALLENGE, cURL } from './const';

const test = anyTest as TestFn<{}>;

// The following tests use an account with the following properties:
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk

test('if the domain is wrong it returns false', async (t) => {
  const wallet = new Wallet({keyToUse: 'full-access'})
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: "myappo.com", nonce: CHALLENGE, callbackUrl: cURL })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.false(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});

test('if the nonce is wrong it returns false', async (t) => {
  const wallet = new Wallet({keyToUse: 'full-access'})
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: APP, nonce: Buffer.from(Array(32)), callbackUrl: cURL })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.false(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});

test('if the accountId is different it returns false', async (t) => {
  const wallet = new Wallet({ keyToUse: "full-access" })
  const { publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: APP, nonce: CHALLENGE, callbackUrl: cURL })
  const accountId = "dev-1659223306990-29456453680391"
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.false(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.true(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});

test('if the message is wrong it returns false', async (t) => {
  const wallet = new Wallet({keyToUse: 'full-access'})
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: "MESSAGE", recipient: APP, nonce: CHALLENGE })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.false(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});

test('if the callbackUrl is wrong it returns false', async (t) => {
  const wallet = new Wallet({ keyToUse: "full-access" })
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: APP, nonce: CHALLENGE, callbackUrl: "cURL" })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.false(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});

test('if the callbackUrl is missing it returns false', async (t) => {
  const wallet = new Wallet({ keyToUse: "full-access" })
  const { accountId, publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: APP, nonce: CHALLENGE })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.false(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});