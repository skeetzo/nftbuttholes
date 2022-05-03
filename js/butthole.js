/*
	Adds a new butthole NFT.
	
	Requires:
		- Ethereum account
	 	- butthole pic (jpg, jpeg, png, etc)
		- [OPTIONAL] 3 alternate donation addresses

	1) prepare Ethereum account address
	- save in spreadsheet or something similar

	2) prepare butthole jpeg for long term storage
	- add image to ipfs, get file hash CID

	3) add new butthole
	- send tx to Buttholes contract via addButthole(newButthole, _tokenURI)
		newButthole --> an Ethereum address that represents a person
		_tokenURI 	--> the newly generated ipfs CID

	4) update the donors / CheekSpreader
	- send tx to Buttholes contract via updateCheekSpreader(address, donor1, donor2, donor3)
*/

require('dotenv').config();
var argv = require('minimist')(process.argv.slice(2),{'string':['a','b','d','n','i']});
const { create } = require('ipfs-http-client');
const ethers = require('ethers');
const { readFileSync } = require('fs');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract //

let account, Buttholes; // connected ETH account & NFT contract

/**
 * @dev Connects to Butthole contract via provided Web3.0 url.
 */
async function connectToContract() {
	try {
		var url = process.env.ETHEREUM_NODE || "http://localhost:8545";
		console.log("Connecting to Ethereum Node: %s", url)
		var web3Provider = new ethers.providers.JsonRpcProvider(url);
		const signer = web3Provider.getSigner();
		account = await signer.getAddress();
		console.debug("Connected Account: %s", account);
		const ButtholesInterface = require('../build/contracts/Buttholes.json');
		const abi = ButtholesInterface.abi;
		const { chainId } = await web3Provider.getNetwork();
		console.debug("Chain ID: %s", chainId);
		const address = ButtholesInterface.networks[chainId].address;
		console.debug("Contract Address: %s", address);
		Buttholes = new ethers.Contract(address, abi, signer);
	}
	catch (err) {
		console.error(err);
		process.exit(1);
	}
}

/**
 * @dev Adds a newly generated butthole NFT.
 * @param newButtholeAddress The artist's ETH address.
 * @param newButtholeURI The CID of the token's metadata.json on IPFS.
 */
async function addButthole(newButtholeAddress, newButtholeURI) {
	console.log("Adding Butthole to Contract: %s -> %s", newButtholeAddress, newButtholeURI);
	const tx = await Buttholes.addButthole(newButtholeAddress, newButtholeURI);
	try {
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			console.debug(event);
			console.log(`Successfully Added Butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
	}
	catch (err) {
		console.error("Unable to add new butthole!");
		console.debug(err);
	}
}

/**
 * @dev Adds donors for the provided ETH address.
 * @param address The artist's ETH address.
 * @param donor1 The 1st donation address.
 * @param donor2 The 2nd donation address.
 * @param donor3 The 3rd donation address.
 */
async function addDonors(address, donor1, donor2, donor3) {
	console.log("Adding Donors to Contract for Address: %s\n-> %s\n-> %s\n-> %s", address, donor1, donor2, donor3);
	// add donors for butthole
	const tx = await Buttholes.updateCheekSpreader(address, donor1, donor2, donor3);
	try {
		const receipt = await tx.wait();
		if (receipt) {
			console.debug(receipt);
			console.log(`Successfully Added Donors: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		else
			console.error("Unable to add new donors!");
	}
	catch (err) {
		console.error("Unable to add new donors!");
		console.debug(err);
	}
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 */
async function renounceButthole() {
	console.log("Renouncing Butthole from Contract: %s", account);
	const tx = await Buttholes.renounceButthole();
	try {
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerDown");
		if (event) {
			console.debug(event);
			console.log("Successfully Renounced Butthole: %s", account);		
		}
	}
	catch (err) {
		console.error("Unable to renounce butthole!");
		console.debug(err);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// IPFS //

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
	nft.attributes.map(a => {if (a["trait_type"] == "edition") a["value"] = butthole.edition });
	// update properties
	nft.properties.artist.value = butthole.artist;
	nft.properties.name.value = butthole.name;
	nft.properties.description.value = butthole.description;
	nft.properties.butthole.value = butthole.image;
	return nft;
}

/**
 * @dev Check if artist name exists already in IPFS.
 * @param butthole An object containing nft metadata.
 */
async function findButthole(butthole) {
	const client = create();
	const cid = '/nft/buttholes/metadata';
	for await (const file of client.ls(cid))
	  if (file.name == butthole.name)
	  	return file;
	return false;
}

/**
 * @dev Uploads content to IPFS: image first then combined metadata.json + image hash / CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButthole(butthole) {
	butthole.properties.image = await uploadButtholeImage(butthole.image);
	return await uploadButtholeMetadata(butthole);
}

/**
 * @dev Upload a butthole's jpeg/png file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeImage(image) {
	const file = {
	  path: `/nfts/buttholes/images`,
	  content: image
	}
	const client = create();
	const { cid } = await client.add(file);
	console.log("Butthole Image Added to IPFS: %s", cid.toString());
	return cid;
}

/**
 * @dev Upload a butthole's metadata.json file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeMetadata(butthole) {
	const file = {
	  path: `/nfts/buttholes/metadata`,
	  content: JSON.stringify(butthole),
      // content: ipfs.types.Buffer.from(btoa(fr.result),"base64")
	}
	const client = create();
	const { cid } = await client.add(file);
	console.log("Butthole Metadata Added to IPFS: %s", cid.toString());
	return cid;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Create and add a new butthole NFT. Update edition number if artist already exists.
 * @param butthole An object containing nft metadata.
 */
async function add(butthole) {
	butthole = createButtholeMetadata(butthole);
	// check if butthole already exists in metadata collection
	let buttholeCID = await findButthole(butthole);
	if (buttholeCID) {
		// console.log(`Found existing Butthole Artist: ${butthole.name} - ${butthole.artist}`);
        console.error(`Butthole Artist ${butthole.name} already exists.`);
        let answer = await rl.question("Add new edition? yes/[n]o: ");
		if (answer.includes("y")) {
			console.log ("Adding new " + butthole.name);
			butthole.attributes.map(a => {if (a["trait_type"] == "edition") a["value"] = parseInt(a["value"]) + 1 });
		}
		else {
			console.log ("Not adding new " + butthole.name);
			return;
		}
	}
	else {
		console.log(`Adding new Butthole Artist: ${butthole.name} - ${butthole.artist}`);
	}
	buttholeCID = await uploadButthole(butthole);
	await addButthole(butthole.artist, buttholeCID);
	if (butthole.donorAddresses.length > 0)
		await update(butthole);
}

/**
 * @dev Update a butthole NFT's CheekSpreader contract data.
 * @param butthole An object containing nft metadata.
 */
async function donors(butthole) {
	console.log("Updating Donors...");
	let defaultDonors = [process.env.DEFAULT_DONATION1, process.env.DEFAULT_DONATION2, process.env.DEFAULT_DONATION3];
	let donor1 = butthole.donors[0],
		donor2 = butthole.donors[1],
		donor3 = butthole.donors[2];
	if (!donor1) {
		donor1 = defaultDonors.shift();
		console.warn("Missing Donor1.");
	}
	if (!donor2) {
		donor2 = defaultDonors.shift();
		console.warn("Missing Donor2.");
	}
	if (!donor3) {
		donor3 = defaultDonors.shift();
		console.warn("Missing Donor3.");
	}
	await addDonors(butthole.artist, donor1, donor2, donor3);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(async function main() {
	console.debug(argv);
	
	let artistAddress,
		donorAddresses = [];
	if (Array.isArray(argv["a"])) {
		artistAddress = argv["a"].shift();
		while (argv["a"].length > 0)
			donorAddresses.push(argv["a"].shift());
	}
	else
		artistAddress = argv["a"];

	const butthole = {
		artist : artistAddress,
		birthday : argv["b"],
		description : argv["d"],
		donors : donorAddresses,
		name : argv["n"],
		image : argv["i"]
	};

	if (!argv["add"]&&!argv["donors"]&&!argv["renounce"]) return console.error("Missing runtime command!");

	await connectToContract();

	// adds new butthole
	if (argv["add"])
		await add(butthole);
	// updates 3 donors
	else if (argv["donors"])
		await donors(butthole);
	else if (argv["renounce"])
		await renounceButthole();
})();