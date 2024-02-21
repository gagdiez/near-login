import { KeyPair } from 'near-api-js';
import * as Borsh from '@dao-xyz/borsh';
import { field, option, fixedArray } from '@dao-xyz/borsh';
import * as js_sha256 from 'js-sha256';

type AccessKey = 'full-access' | 'function-call'

class SignMessageParams {
  message: string; // The message that wants to be transmitted.
  recipient: string; // The recipient to whom the message is destined (e.g. "alice.near" or "myapp.com").
  nonce: Buffer; // A nonce that uniquely identifies this instance of the message, denoted as a 32 bytes array (a fixed `Buffer` in JS/TS).
  callbackUrl?: string; // Optional, applicable to browser wallets (e.g. MyNearWallet). The URL to call after the signing process. Defaults to `window.location.href`.
}

class Payload {
  @field({ type: 'u32' })
  tag: number; // Always the same tag: 2**31 + 413

  @field({ type: 'string' })
  message: string; // The same message passed in `SignMessageParams.message`

  @field({ type: fixedArray('u8', 32) })
  nonce: number[]; // The same nonce passed in `SignMessageParams.nonce`

  @field({ type: 'string' })
  recipient: string; // The same recipient passed in `SignMessageParams.recipient`

  @field({ type: option('string') })
  callbackUrl?: string;

  constructor({ message, nonce, recipient, callbackUrl }: Payload) {
    this.tag = 2147484061;
    Object.assign(this, { message, nonce, recipient, callbackUrl })
  }
}

class AuthenticationToken {
  accountId: string; // The account name as plain text (e.g. "alice.near")
  publicKey: string; // The public counterpart of the key used to sign, expressed as a string with format "<key-type>:<base-64-key-bytes>"
  signature: string; // The base64 representation of the signature.
}

// Emulate the wallet of a real user
// accountId: dev-1659223306990-29456453680390
// full-access key1: ed25519:DPzNzTL3jnPzhJ68HFNvEYN8qjD1WcLiXgoCF1iTRQbB
// full-access key2: ed25519:B2FAeEg5rcseC62uD9S9TYaiZWNQXK2x7WMwPnZ7Yhye
// function-call key: ed25519:BfsC1Mznbp8JmHTEV4cCHU2GZWj5ZaMkEphV3C1Bpfpk
export class Wallet {
  readonly keyPair: KeyPair;
  readonly accountId: string;

  constructor({ keyToUse }: { keyToUse: AccessKey }) {
    const fak = "ed25519:2NoJqvZkgsAwm7kigB4QbwiQtdeK7xdBNQvvZ82qeYgMvguuTuggFKjFfaAcHiuidHQEuUmSU2RAQcNCRutUJbzH";
    const fck = "ed25519:3zsuvDCiwT11GKV99K72ozYoda1WSDEZ8cS227UohZCrBCR1Q6FiENsytAqUpUHxmvUPjRovg24mVM2puWn8Js76";

    this.keyPair = keyToUse == "full-access" ? KeyPair.fromString(fak) : KeyPair.fromString(fck);
    this.accountId = "dev-1659223306990-29456453680390";
  }

  async signMessage({ message, recipient, nonce, callbackUrl }: SignMessageParams): Promise<AuthenticationToken> {
    // Get key from the wallet
    const Key = this.keyPair;

    // Check the nonce is a 32bytes array
    if (nonce.byteLength != 32) { throw Error("Expected nonce to be a 32 bytes buffer") }

    // Create the payload and sign it
    const payload = new Payload({ tag: 2147484061, message, nonce: Array.from(nonce), recipient, callbackUrl });
    const borshPayload = Borsh.serialize(payload);
    const hashedPayload = js_sha256.sha256.array(borshPayload)
    const { signature } = Key.sign(Uint8Array.from(hashedPayload))

    const encoded: string = Buffer.from(signature).toString('base64')

    // Return the AuthenticationToken
    return { accountId: this.accountId, publicKey: this.keyPair.getPublicKey().toString(), signature: encoded }
  }
}