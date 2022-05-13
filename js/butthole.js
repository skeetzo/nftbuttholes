#!/usr/bin/env node
// Add, update, or renounce a butthole NFT.

require('dotenv').config();
const ButtholesContract = require('./Buttholes.js');
const ethers = require('ethers');
const { checkExistingButtholes, uploadButthole } = require('./ipfs.js');
const { readFileSync } = require('fs');
const path = require('path');

////////////////////////////////////////////////////////////////////////

// Testing Shims //

function _reload() {window.location.reload();}
function _alert(str) {alert(str);}
if (typeof window !== 'undefined') {
  // on the browser
} else {
  // on the server
  window = {"ethereum":"http://localhost:8545"};
  _reload = function() {};
  _alert = function() {};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Metadata //

// return skeleton {} metadata
/**
 * @dev Loads and returns the default butthole metadata template.
 */
function _getDefaultMetadata() {
	const nft = require('./metadata.json', 'utf8');
	nft.animation_url = process.env.DEFAULT_ANIMATION_URI
	const date = new Date();
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	nft.attributes.birthday = unixTimestamp;
	// Properties //
	// image
	nft.properties.image.value = process.env.DEFAULT_PLACEHOLDER_URI
	// butthole
	nft.properties.butthole.value = process.env.DEFAULT_PLACEHOLDER_URI
	nft.properties.edition.value = 1;
	return nft;
}

/**
 * @dev Create's a butthole NFT's metadata from the provided butthole data.
 * @param butthole An object containing nft metadata.
 */
function createButtholeMetadata(butthole) {
	// load default metadata.json and update default values
	const nft = _getDefaultMetadata();
	// update birthday
	// https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
	function _getAge(dateString) {
	    var today = new Date();
	    var birthDate = new Date(dateString);
	    var age = today.getFullYear() - birthDate.getFullYear();
	    var m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}
	const date = new Date(butthole.birthday);
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	const age = _getAge(butthole.birthday);
	console.log(`Birthday: (${age}) ${butthole.birthday} --> ${unixTimestamp}`);
	// update attributes
	nft.attributes.map(a => {if (a["trait_type"] == "birthday") a["value"] = unixTimestamp });
	nft.attributes.map(a => {if (a["trait_type"] == "level") a["value"] = age });
	// update properties
	nft.properties.artist.value = butthole.artist;
	nft.properties.name.value = butthole.name;
	nft.properties.description.value = butthole.description;
	nft.properties.butthole.value = butthole.image;
	return nft;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract Interface //

var _ButtholesContract;

/**
 * @dev Connect to and return the Buttholes contract as an ethers object.
 */
async function getContract() {
	if (_ButtholesContract) return _ButtholesContract;
	let web3Provider, signer;
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
	      _alert("Be sure to unlock your wallet!");
	      console.error(err.message);
	    }
	  }
	  function _static() {
	    try {
	      web3Provider = new ethers.providers.StaticJsonRpcProvider(window.ethereum ?? "localhost:8545");
	    	console.debug("connected to: static provider")
	    }
	    catch (err) {
	      _alert("Be sure to unlock your wallet!");
	      console.error(err.message);
	    }
	  }
	  _default();
	  if (!web3Provider&&window.ethereum) _web3();
	  if (!web3Provider) _static();
	  if (!web3Provider) return console.error("Unable to connect to provider!");
		// await web3Provider.send("eth_requestAccounts", []);
	  signer = web3Provider.getSigner();
	  let account = await signer.getAddress();
	  console.debug("Connected Account: %s", account);
	  const contract = require('../build/contracts/Buttholes.json');
	  const abi = contract.abi;
	  // load network to find contract address
	  const { chainId } = await web3Provider.getNetwork();
	  console.log("Chain ID: %s", chainId); // 42
	  const address = contract.networks[chainId].address;
	  console.log("Contract Address: %s", address);
	  _ButtholesContract = new ethers.Contract(address, abi, signer);
	  web3Provider.on("network", (newNetwork, oldNetwork) => {
	    // When a Provider makes its initial connection, it emits a "network"
	    // event with a null oldNetwork along with the newNetwork. So, if the
	    // oldNetwork exists, it represents a changing network
	    if (oldNetwork) {
	      if (oldNetwork != 0)
	        _alert("Please connect your wallet to the Ethereum network!");
	      _reload();
	    }
	  });
	  console.debug("successfully connected to contract!");
	  return _ButtholesContract;
	}
	catch (err) {
		console.warn("failed to connect to contract!");
		console.error(err);
		// alert("Please refresh the page!");
		_reload();
	}
}

////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Create and add a new butthole NFT. Update edition number if artist already exists.
 * @param butthole An object containing nft metadata.
 */
async function add(butthole) {
	const d = butthole.starvingArtists; 
	butthole = createButtholeMetadata(butthole);
	butthole.starvingArtists = d;
	await checkExistingButtholes(butthole);
	buttholeCID = await uploadButthole(butthole);
	if (buttholeCID.length==0) return false;
	let successful = await ButtholesContract.add(await getContract(), butthole.properties.artist.value, buttholeCID);
	if (successful && butthole.starvingArtists.length > 0)
		return await update(butthole);
	return successful;
}

/**
 * @dev Add to minter role / confirm 18+.
 */
async function addMinter() {
	return await ButtholesContract.addMinter(await getContract());
};

/**
 * @dev Fill missing starving artist values.
 * @param butthole An object containing nft metadata.
 */
function _fillArtists(butthole) {
	let defaultStarvingArtists = [process.env.DEFAULT_DONATION1, process.env.DEFAULT_DONATION2, process.env.DEFAULT_DONATION3];
	let artist1 = butthole.starvingArtists[0],
		artist2 = butthole.starvingArtists[1],
		artist3 = butthole.starvingArtists[2];
	if (!artist1) {
		artist1 = defaultStarvingArtists.shift();
		console.warn("Missing Donor1.");
	}
	if (!artist2) {
		artist2 = defaultStarvingArtists.shift();
		console.warn("Missing Donor2.");
	}
	if (!artist3) {
		artist3 = defaultStarvingArtists.shift();
		console.warn("Missing Donor3.");
	}
	return { 'artist1': artist1, 'artist2': artist2, 'artist3': artist3 };
}

/**
 * @dev Check if the provided address has admin role.
 * @param address The address to check if admin.
 */
async function isAdmin(address) {
	return ButtholesContract.isAdmin(await getContract(), address);
}

/**
 * @dev Check if the provided address has minter role.
 * @param address The address to check if minter.
 */
async function isMinter(address) {
	return ButtholesContract.isMinter(await getContract(), address);
}

/**
 * @dev Mint a Butthole NFT.
 * @param to The address to mint to.
 */
async function mint(to) {
	return await ButtholesContract.mint(await getContract(), to);
}

/**
 * @dev Update a butthole NFT's CheekSpreader contract data.
 * @param butthole An object containing nft metadata.
 */
async function update(butthole) {
	const { artist1, artist2, artist3 } = _fillArtists(butthole);
	return await ButtholesContract.update(await getContract(), !isNaN(butthole.properties) ? butthole.properties.artist.value : butthole.artist, artist1, artist2, artist3);
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 */
async function renounce() {
	return await ButtholesContract.renounce(await getContract());
}

module.exports = {
	add, addMinter, createButtholeMetadata, isAdmin, isMinter, mint, update, renounce
}