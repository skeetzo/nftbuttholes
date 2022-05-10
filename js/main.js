
const { create } = require('ipfs-http-client');
const IPFS = create();

const { ethers } = require("ethers");

// import * as IPFS from 'ipfs-core'

const $ = require('jquery')

// const ipfs = await IPFS.create()

const DEFAULT_URI = "ipfs://";

var Buttholes;
var web3Provider;
var signer;
var account;

var divs = [];

////////////////////////////////////////////////////////////////////////////////////

// Contract //

/**
 * @dev Connects to contract.
 */
async function connectToContract() {
	try {
	  function _default() {
	    try {
	      web3Provider = new ethers.getDefaultProvider(window.ethereum);
	    	console.debug("connected to: default provider")
	    }
	    catch (err) {
	      console.error(err.message);
	    }
	  }
	  function _web3() {
	    try {
	      web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
	    	console.debug("connected to: web3 provider")
	    }
	    catch (err) {
	      alert("Be sure to unlock your wallet!");
	      console.error(err.message);
	    }
	  }
	  function _static() {
	    try {
	      web3Provider = new ethers.providers.StaticJsonRpcProvider(window.ethereum ?? "localhost:8545");
	    	console.debug("connected to: static provider")
	    }
	    catch (err) {
	      alert("Be sure to unlock your wallet!");
	      console.error(err.message);
	    }
	  }
	  _default();
	  if (!web3Provider&&window.ethereum) _web3();
	  if (!web3Provider) _static();
	  if (!web3Provider) return console.error("Unable to connect to provider!");
		// await web3Provider.send("eth_requestAccounts", []);
	  signer = web3Provider.getSigner();
	  account = await signer.getAddress();
	  console.debug("address: "+account);
	  //
	  const ButtholesInterface = require('../build/contracts/Buttholes.json');
		const abi = ButtholesInterface.abi;
		// load network to find contract address
		const { chainId } = await web3Provider.getNetwork();
		console.log("Chain ID: %s", chainId); // 42
		const address = ButtholesInterface.networks[chainId].address;
		console.log("Contract Address: %s", address);
		Buttholes = new ethers.Contract(address, abi, signer);
	  web3Provider.on("network", (newNetwork, oldNetwork) => {
	    // When a Provider makes its initial connection, it emits a "network"
	    // event with a null oldNetwork along with the newNetwork. So, if the
	    // oldNetwork exists, it represents a changing network
	    if (oldNetwork) {
	      if (oldNetwork != 0)
	        alert("Please connect your wallet to the Ethereum network!");
	      window.location.reload();
	    }
	  });
		console.debug("successfully connected to contract!");
	}
	catch (err) {
		console.warn("failed to connect to contract!");
		console.error(err);
	}
}

////////////////////////////////////////////////////////////////////////////////////

// IPFS //

/**
 * @dev Get the butthole NFT metadata from IPFS.
 * @param buttholeURI The butthole NFT to get.
 */
async function getButtholeFromIPFS(buttholeURI) {
	return JSON.parse(await IPFS.files.cat(buttholeURI));
}

/**
 * @dev Get the butthole NFT image from IPFS.
 * @param buttholeURI The butthole NFT to get.
 */
async function getButtholeImageFromIPFS(buttholeURI) {
	let file = await IPFS.files.cat(buttholeURI);
	return file.toString("base64");
}



// if they have an IPFS enabled browser, return
// <!-- <img src="https://ipfs.infura.io:5001/api/v0/cat/QmQuTjzy8aZyYqYRyH7UdE5qcDXTxLFYEE9GKNhPY6D6K1"> -->

// if they do not have an IPFS enabled browser, fetch the image resource for them



/**
 * @dev Get all butthole tokens owned by connected wallet.
 */
async function getButtholes() {
	let balance = await Buttholes.balanceOf(account)
	let buttholes = [];
	for (let i=0;i<balance;i++) {
		let butthole = await Buttholes.tokenOfOwnerByIndex(i);
		butthole = await Buttholes.tokenURI(butthole);
		butthole = await getButtholeFromIPFS(butthole);
		buttholes.push(butthole);
	}
	if (buttholes.length == 0) return console.log("No buttholes found!");
	console.log("Buttholes: "+buttholes.join(", "));
	return buttholes;
}

/**
 * @dev Show the image for the provided butthole NFT.
 * @param butthole The butthole NFT metadata.
 */
function showButthole(butthole) {
	console.log(`Showing butthole: ${butthole.tokenId} - ${butthole.properties.name.value}`);
	var iDiv = document.createElement('img');
	iDiv.id = butthole.tokenId;
	iDiv.className = 'butthole';
  iDiv.src= "data:image/png;base64," + getButtholeImageFromIPFS(butthole.properties.butthole.value);
	document.getElementsByTagName('body')[0].appendChild(iDiv);
	// buttflap
	var innerDiv = document.createElement('img');
	innerDiv.className = 'flap'
	iDiv.src = !isNan(butthole.properties.image.value) ? butthole.properties.image.value : DEFAULT_URI;
	iDiv.appendChild(innerDiv);
	divs.push(iDiv);
}

////////////////////////////////////////////////////////////////////////////////////

// Interface //

document.getElementById("connect").onclick = async function () {
	try {
		window.ethereum.request({ method: 'eth_requestAccounts' });
		console.log("successfully connected wallet!");
		await connectToContract();
		$("#eighteen").show();
		$("#connect").hide();
	}
	catch (err) {
		console.warn("failed to connect wallet!");
		console.error(err);
	}
}

/**
 * @dev Confirm 18+ and add minter role.
 */
document.getElementById("eighteen").onclick = async function () {
	try {
		let role = await Buttholes.MINTER_ROLE();
		console.log(role);
		if (!await Buttholes.hasRole(await Buttholes.MINTER_ROLE, account)) {
			const gasLimit = await Buttholes.estimateGas.addMinter();
			const tx = await Buttholes.addMinter({'gasLimit':gasLimit});
			const receipt = await tx.wait();
			console.log(receipt.logs);
			const event = receipt.events.find(x => x.event === "RoleGranted");
			console.log(event);
			console.log(event.args.account); // account
			//
			console.log("successfully added minting!");		    
			$("#mint").enable();
		}
		if (await Buttholes.hasRole(await Buttholes.DEFAULT_ADMIN_ROLE(), account)) {	
			$("#add").show();
			$("#add").enable();
		}
		$("#mint").show();
		$("view").show();
		$("#eighteen").hide();
		console.log("successfully accepted consequences!");
	}
	catch (err) {
		console.error(err);
	}
};

/**
 * @dev Updates starving artists.
 */
document.getElementById("update").onclick = async function () {
	// TODO
	// add method for inputting 3 donor addresses
	let donor1, donor2, donor3;
	//
	const gasLimit = await Buttholes.estimateGas.createCheekSpreader(donor1, donor2, donor3);
	const tx = await Buttholes.createCheekSpreader(donor1, donor2, donor3, {'gasLimit':gasLimit});
	const receipt = await tx.wait();
	console.log(receipt.logs);
	const event = receipt.events.find(x => x.event === "Transfer");
	if (event) {
		console.log(event);
		console.log(event.args.account); // account
		console.log(event.args.tokenId.toString());
	}
};

/**
 * @dev Mint butthole. Requires minter role.
 */
document.getElementById("mint").onclick = async function () {
	const gasLimit = await Buttholes.estimateGas.mint(account);
	const tx = await Buttholes.mint(account, {'gasLimit':gasLimit});
	const receipt = await tx.wait();
	console.log(receipt.logs);
	const event = receipt.events.find(x => x.event === "Transfer");
	if (event) {
		console.log(event);
		console.log(event.args.account); // account
		console.log(event.args.tokenId.toString());
	}
};

/**
 * @dev View butthole NFT images in connected wallet.
 */
document.getElementById("view").onclick = async function () {
	for (div of divs)
		div.remove();
	let buttholes = getButtholes();
	for (butthole of buttholes)
		showButthole(butthole);
};

////////////////////////////////////////////////////////////////////////////////////

//- checks for Metamask
$(document).ready(() => {
	if (typeof window.ethereum !== 'undefined') {
		console.log('MetaMask is installed!');
		ethereum.on('chainChanged', (chainId) => {
		  console.debug("chainId: %s", chainId);
		  if (chainId != 0) alert("Please connect your wallet to the Ethereum network!");
		});
	}
	else
		console.error("Please install MetaMask!");
});
