require('dotenv').config();

var ethers = require('ethers');
var url = "127.0.0.1";
// var url = "skeetzo.com"
var provider = new ethers.providers.JsonRpcProvider(url);
console.debug("-- connected to Ethereum node ---");

////////////////////////////////////////////////////////////////////////////////////

let account = ?

////////////////////////////////////////////////////////////////////////////////////

// Load Contract //

const ButtholesInterface = require('../build/Buttholes.json');
const abi = ButtholesInterface.abi;
// load network to find contract address
const { chainId } = await provider.getNetwork();
console.log("Chain ID: %s",chainId); // 42
const address = ButtholesInterface.networks[chainId].address;
console.log("Contract Address: %s", address);
const buttholesContract = new ethers.Contract(address, abi, provider);

////////////

const defaultURI = process.env.BASE_URI;

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
}

////////////////////////////////////////////////////////////////////////////////////

// Interface //

// TODO
// 18+ confirm
//- allow user to click other buttons
document.getElementById("eighteen").onclick = function () {
	document.getElementById("add").enable();
	document.getElementById("view").enable();
	document.getElementById("mint").enable();
	document.getElementById("eighteen").hide();
	console.log("successfully accepted consequences!")
};

//- pay for / add butthole to wallet
document.getElementById("mint").onclick = function () {
	// TODO
	// mint butthole
};

//- view butthole images
document.getElementById("view").onclick = function () {
	let tokens = getButtholes(account);
	for (tokenId of tokens)
		showButthole(tokenId, await buttholesContract.tokenURI(tokenId));
};

