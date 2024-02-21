import anyTest, { TestFn } from 'ava';
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../authenticate/wallet-authenticate';
import { Wallet } from './wallet';
import { MESSAGE, APP, CHALLENGE, cURL } from './const';

const test = anyTest as TestFn<{}>;

test('authenticates user', async (t) => {
  const wallet = new Wallet({ keyToUse: "full-access" })

  const { accountId, publicKey, signature } = await wallet.signMessage({ message: MESSAGE, recipient: APP, nonce: CHALLENGE, callbackUrl: cURL })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.true(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.true(await verifySignature({ publicKey, signature }))
  t.true(authenticated)
});