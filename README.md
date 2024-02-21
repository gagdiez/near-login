# NEAR Login

Simple example of how to use NEAR's signMessage capabilities ([NEP-413](https://github.com/near/NEPs/blob/master/neps/nep-0413.md)) to login a user into a backend service.

This example is composed of two parts: a client that signs a message using the NEAR Wallet, and a server that authenticates the signatures and returns a [JWT token](https://jwt.io/) to the client. The use of a JWT token allows the example to be stateless, meaning that no information about the user is stored on the server.

> [!WARNING]
> This example is for educational purposes only. Please change it accordingly to your needs before using it in a production environment.

## Server
The server exposes two important methods: `login` and `secret`. The `login` method receives a signed message from the client and returns a JWT token that allows the client to authenticate when calling the `secret` endpoint.

The token expires after 3.6 seconds. 

#### Run the Server

```bash
cd server
yarn install
yarn start
```

## Client
The client is a simple web application that uses the NEAR Wallet to sign a message and sends it to the server. Once the server authenticates the signature, the client will obtain a JWT token that is used in subsequent requests for the `secret`.

```bash
cd client
yarn install
yarn start
```

---

## Changes needed to run use this in production
Multiple changes are needed to use this example safely in production, here are some of them:
1. The server should use HTTPS.
2. The server should create differents challenges for each authentication (variating the `nonce` of the `payload` the client signs).
3. The server should use a strong secret to sign the JWT token, and it should not be hardcoded.

