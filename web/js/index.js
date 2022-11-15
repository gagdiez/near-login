// Redirect users to sign the message in MyNearWallet
function signMessage({message, callbackUrl="http://localhost:3000/user/login"}){
  // TODO: Figure out how to use other wallets
  let params = `message=${message}`
  params += callbackUrl? `&callbackUrl=${callbackUrl}`:""
  window.location.replace(`https://testnet.mynearwallet.com/verify-owner?${params}`);
}

$('#login-btn').click(() => { signMessage({message: "example-message"}) }) 
$('#logout-btn').click(() => { window.location.replace('/user/logout') }) 