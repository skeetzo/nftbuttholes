require('dotenv').config();

////////////

let account = null;
const defaultURI = process.env.BASE_URI;

////////////

const { ethers } = require("ethers");
// var url = "127.0.0.1";
// var url = "skeetzo.com"
// const provider = new ethers.providers.JsonRpcProvider(url);
const provider = new ethers.providers.Web3Provider(window.ethereum)
// const signer = provider.getSigner()
console.debug("-- connected to Ethereum node ---");

////////////////////////////////////////////////////////////////////////////////////

// Contract //

const ButtholesInterface = require('../build/Buttholes.json');
const abi = ButtholesInterface.abi;
// load network to find contract address
const { chainId } = await provider.getNetwork();
console.log("Chain ID: %s",chainId); // 42
const address = ButtholesInterface.networks[chainId].address;
console.log("Contract Address: %s", address);
const buttholesContract = new ethers.Contract(address, abi, provider);


////////////////////////////////////////////////////////////////////////////////////

// Ethers / Web3.0 //

// request account from connect web wallet
async function requestAccount() {
  console.debug("requesting Ethereum account...");
  const accounts = await ethers.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  console.debug("account: "+account);
  return account;
}

////////////////////////////////////////////////////////////////////////////////////

// get all tokens owned by connected wallet
async function getButtholes(account) {
	let balance = await buttholesContract.balanceOf(account)
	let tokens = [];
	for (let i=0;i<balance;i++) {
		let token = await buttholesContract.tokenOfOwnerByIndex(i);
		tokens.push(token);
	}
	if (tokens.length == 0) return console.log("No tokens found!");
	console.log("Tokens: "+tokens.join(", "));
	return tokens;
}

let divs = [];
function showButthole(tokenId, tokenURI) {
	console.log("Showing butthole: %s - %s", tokenId, tokenURI);
	// butthole
	var iDiv = document.createElement('img');
	iDiv.id = tokenId;
	iDiv.className = 'butthole';
	iDiv.src = tokenURI;
	document.getElementsByTagName('body')[0].appendChild(iDiv);
	// buttflap
	var innerDiv = document.createElement('img');
	innerDiv.className = 'flap'
	iDiv.src = defaultURI;
	iDiv.appendChild(innerDiv);
	divs.push(iDiv);
}

////////////////////////////////////////////////////////////////////////////////////

// Contract Interface //

//- 18+ confirm
document.getElementById("eighteen").onclick = async function () {
	try {
		account = await requestAccount();
		if (!await buttholesContract.hasRole(await buttholesContract.MINTER_ROLE(), account)) {	
			const tx = await buttholesContract.addMinter({'from':account});
			const receipt = await tx.wait();
			console.log(receipt.logs);
			const event = receipt.events.find(x => x.event === "RoleGranted");
			console.log(event);
			console.log(event.args.account); // account
			//
			console.log("successfully added minting!");
		}
		document.getElementById("add").enable();
		document.getElementById("mint").enable();
		document.getElementById("view").enable();
		document.getElementById("eighteen").hide();
		console.log("successfully accepted consequences!");
	}
	catch (err) {
		console.error(err);
	}
};

//- mint butthole after minter role has been added
document.getElementById("mint").onclick = async function () {
	const tx = await buttholesContract.mint(account);
	const receipt = await tx.wait();
	console.log(receipt.logs);
	const event = receipt.events.find(x => x.event === "Transfer");
	console.log(event);
	// console.log(event.args.account); // account
};

//- view butthole images in wallet
document.getElementById("view").onclick = async function () {
	for (div of divs)
		div.remove();
	let tokens = getButtholes(account);
	for (tokenId of tokens)
		showButthole(tokenId, await buttholesContract.tokenURI(tokenId));
	// document.getElementById("view").disable();
};

////////////////////////////////////////////////////////////////////////////////////

//- Connects Ethereum account from enabled Wallet
$(document).ready(() => {
  if (typeof window.ethereum !== 'undefined') console.log('MetaMask is installed!');
  ethereum.on('chainChanged', (chainId) => {
    console.debug("chainId: %s", chainId);
    if (chainId != 0) alert("Please connect your wallet to the Ethereum network!");
  });
});