#!/usr/bin/env node
// Add, update, or renounce a butthole NFT.

require('dotenv').config();
const ButtholesContract = require('./Buttholes.js');
const commander = require('commander'),
	  Command = commander.Command;
const ethers = require('ethers');
const ipfs = require('./ipfs.js');
const { readFileSync } = require('fs');
const path = require('path');

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
	return nft;
}

/**
 * @dev Create's a butthole NFT's metadata from the provided butthole data.
 * @param butthole An object containing nft metadata.
 */
function _createButtholeMetadata(butthole) {
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

var ButtholesContract;
async function getContract() {
	if (ButtholesContract) return ButtholesContract;
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
	  console.debug("Connected Account: %s", account);
	  const contract = require('../build/contracts/Buttholes.json');
	  const abi = contract.abi;
	  // load network to find contract address
	  const { chainId } = await web3Provider.getNetwork();
	  console.log("Chain ID: %s", chainId); // 42
	  const address = contract.networks[chainId].address;
	  console.log("Contract Address: %s", address);
	  ButtholesContract = new ethers.Contract(address, abi, signer);
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
	  return ButtholesContract;
	}
	catch (err) {
		console.warn("failed to connect to contract!");
		console.error(err);
		// alert("Please refresh the page!");
		reload();
	}
}

////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Create and add a new butthole NFT. Update edition number if artist already exists.
 * @param butthole An object containing nft metadata.
 */
async function add(butthole) {
	const d = butthole.starvingArtists; 
	butthole = _createButtholeMetadata(butthole);
	butthole.starvingArtists = d;
	butthole = await ipfs.checkExistingButtholes(butthole);
	console.log(`Adding new Butthole: ${butthole.properties.name.value} - ${butthole.properties.artist.value}`);
	buttholeCID = await ipfs.uploadButthole(butthole);
	await ButtholesContract.add(await getContract(), butthole.properties.artist.value, buttholeCID);
	if (butthole.starvingArtists.length > 0)
		await ButtholesContract.update(await getContract(), butthole);
}

async function addMinter() {
	await ButtholesContract.addMinter(await getContract());
};

async function isAdmin(address) {
	return ButtholesContract.isAdmin(await getContract(), address);
}

async function isMinter(address) {
	return ButtholesContract.isMinter(await getContract(), address);
}

/**
 * @dev Mint a Butthole NFT.
 * @param to The address to mint to.
 */
async function mint(to) {
	await ButtholesContract.mint(await getContract(), to);
}

/**
 * @dev Update a butthole NFT's CheekSpreader contract data.
 * @param butthole An object containing nft metadata.
 */
async function update(butthole) {
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
	await ButtholesContract.update(await getContract(), butthole.properties ? butthole.properties.artist.value : butthole.artist, artist1, artist2, artist3);
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 */
async function renounce(ButtholesContract=null) {
	await ButtholesContract.renounce(await getContract());
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Commander //

// ensure value is an 0x address
function parseAddress(value) {
	if (!ethers.utils.isAddress(value))
	    throw new commander.InvalidArgumentError('Not an ETH address.');
	return value;
}

// ensure value is a date value that equates to a unix timestamp
function parseDate(value) {
	if (!isValidDate(value))
	    throw new commander.InvalidArgumentError('Not a date.');
	return value;
}

// https://stackoverflow.com/questions/6177975/how-to-validate-date-with-format-mm-dd-yyyy-in-javascript
function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Add an artist, addMinter, mint, update starving artists, or renounce a butthole NFT.
 */
(async function main() {

	const program = new Command();

	const butthole = {
		'artist' : "",
		'image' : "",
		'name' : "",
		'description' : "",
		'birthday' : "",
		'starvingArtists' : []
	};

	program
	  .name('buttholes')
	  .description('CLI to some Butthole NFT utilities')
	  .version('0.0.10');

	program.command('add')
	  .description('Add a butthole.')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .argument('<image>', 'The local path to the butthole image')
	  .option('-n, --name <string>', 'The artist\'s name')
	  .option('-d, --description <string>', 'The artist\'s description')
	  .option('-b, --birthday <date>', 'The artist\'s birthday (MM/DD/YYYY)', parseDate)
	  .option('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole add 0x00.. /path/to/image.jpg -n "My Name" -d "A description." -b "06/06/1990 -s 0x01.. 0x02.. 0x03..`)
	  .action(async (artist, image, options) => {
	  	butthole.artist = artist;
	  	butthole.image = image;
	  	butthole.name = options.name;
	  	butthole.description = options.description;
	  	butthole.birthday = options.birthday;
	  	butthole.starvingArtists = options.starve;
	  	await add(butthole);
	  });

	program.command('addMinter')
	  .description('Add caller as a minter.')
	  .action(addMinter);

	program.command('mint')
	  .description('Mint a butthole.')
	  .argument('<address>', 'The receiving address.', parseAddress)
	  .addHelpText('after', `
Example call:
 $ butthole mint 0x00.. `)
	  .action(async (to) => {
	  	await mint(to);
	  });

	program.command('update')
	  .description('Update your starving artist(s).')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .requiredOption('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole update 0x00.. -s 0x01.. 0x02.. 0x03..`)
	  .action(async (artist, options) => {
	  	butthole.artist = artist;
	  	butthole.starvingArtists = options.starve;
	  	await update(butthole);
	  });

	program.command('renounce')
	  .description('Renounce your butthole.')
	  .action(renounce);

	await program.parseAsync(process.argv);

})();

module.exports = {
	add, addMinter, isAdmin, isMinter, mint, update, renounce
}