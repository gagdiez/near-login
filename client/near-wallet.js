/* A helper file that simplifies using the wallet selector */

// wallet selector UI
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';

// wallet selector options
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

// Wallet that simplifies using the wallet selector
export class Wallet {
  walletSelector;
  wallet;
  network;
  createAccessKeyFor;

  constructor({ createAccessKeyFor = undefined, network = 'testnet' }) {
    // Login to a wallet passing a contractId will create a local
    // key, so the user skips signing non-payable transactions.
    // Omitting the accountId will result in the user being
    // asked to sign all transactions.
    this.createAccessKeyFor = createAccessKeyFor
    this.network = 'testnet'
  }

  // To be called when the website loads
  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [setupMyNearWallet()],
    });

    const isSignedIn = this.walletSelector.isSignedIn();

    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet();
      this.accountId = this.walletSelector.store.getState().accounts[0].accountId;
    }

    return isSignedIn;
  }

  // Sign-in method
  signIn() {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(this.walletSelector, { contractId: this.createAccessKeyFor, description });
    modal.show();
  }

  // Sign-out method
  signOut() {
    this.wallet.signOut();
    this.wallet = this.accountId = this.createAccessKeyFor = null;
    window.location.replace(window.location.origin + window.location.pathname);
  }

  signMessage() {
    const message = "log me in";
    const recipient = "http://localhost:3000";
    const challenge = Buffer.from(Array.from(Array(32).keys()))
    const callbackUrl = "http://localhost:1234"

    this.wallet.signMessage({ message, recipient, nonce: challenge, callbackUrl})
  }
}