import anyTest, { TestFn } from 'ava';
import { authenticate, verifyFullKeyBelongsToUser, verifySignature } from '../authenticate/wallet-authenticate';
import { Wallet } from './wallet';
import { MESSAGE, APP, CHALLENGE, cURL } from './const';

const test = anyTest as TestFn<{}>;

test('authenticates user', async (t) => {
  const wallet = new Wallet({ keyToUse: "function-call" })

  const [message, recipient, nonce, callbackUrl] = [MESSAGE, APP, CHALLENGE, cURL];

  const { accountId, publicKey, signature } = await wallet.signMessage({ message, recipient, nonce, callbackUrl })
  const authenticated = await authenticate({ accountId, publicKey, signature })

  t.false(await verifyFullKeyBelongsToUser({ publicKey, accountId }))
  t.true(await verifySignature({ publicKey, signature }))
  t.false(authenticated)
});