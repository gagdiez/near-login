export class Payload {
    constructor({ message, nonce, recipient, callbackUrl }) {
        this.prefix = 2147484061;
        this.message = message;
        this.nonce = nonce;
        this.recipient = recipient;
        if (callbackUrl) { this.callbackUrl = callbackUrl }
    }
}

export const payloadSchema = new Map([[Payload, { kind: 'struct', fields: [['prefix', 'u32'], ['message', 'string'], ['nonce', [32]], ['recipient', 'string'], ['callbackUrl', { kind: 'option', type: 'string' }]] }]]);