class Payload {
    constructor({ message, nonce, recipient, callbackUrl }) {
        this.tag = 2147484061;
        this.message = message;
        this.nonce = nonce;
        this.recipient = recipient;
        if (callbackUrl) { this.callbackUrl = callbackUrl }
    }
}

const payloadSchema = { struct: { tag: 'u32', message: 'string', nonce: { array: { type: 'u8', len: 32 } }, recipient: 'string', callbackUrl: { option: 'string' } } }

module.exports = { Payload, payloadSchema }