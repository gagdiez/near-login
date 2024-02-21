import { Wallet } from "./near-wallet";

const wallet = new Wallet({});

window.onload = async () => {
  let isSignedIn = await wallet.startUp();

  if (isSignedIn) {
    $('#login-btn').hide();
    $('#logout-btn').show();
    $('#sign-btn').show();
  } else {
    $('#login-btn').show();
    $('#logout-btn').hide();
    $('#sign-btn').hide();
  }

  handleServer();
}

async function handleServer() {
  let jwt = ''

  // get accountId, signature and publicKey from URL HASH
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const accountId = params.get('accountId');
  const signature = params.get('signature');
  const publicKey = params.get('publicKey');
  console.log(accountId, signature, publicKey);

  if (accountId && signature && publicKey) {
    $('#message').text('Verifying signature...');

    const response = await fetch(
      'http://localhost:3000/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, signature, publicKey })
      })

    jwt = await response.json();
    console.log('Obtained the token', jwt)

    $('#message').text(jwt ? 'Successfully logged' : 'Failed login');
  }

  const response = await fetch(
    'http://localhost:3000/secret',
    { method: 'GET', headers: { 'Authorization': `bearer ${jwt}` } }
  )

  const message = await response.json()

  $('#message').text(message)
}

$('#sign-btn').click(() => { wallet.signMessage() })
$('#logout-btn').click(() => { wallet.signOut() })
$('#login-btn').click(() => { wallet.signIn() })
