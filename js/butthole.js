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
const ethers = require('ethers');
const { readFileSync } = require('fs');
const path = require('path');

// https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-js
const readline = require('readline');
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const { create } = require('ipfs-http-client');
const IPFS = create();

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
	try {
		const gasLimit = await Buttholes.estimateGas.addButthole(newButtholeAddress.toString(), newButtholeURI.toString());
		const tx = await Buttholes.addButthole(newButtholeAddress.toString(), newButtholeURI.toString(), {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			// console.debug(event);
			console.log(`Successfully Added Butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		else
			console.warn("Failed to add new butthole!");
	}
	catch (err) {
		// console.error(err);
		console.warn("Unable to add new butthole!");
		console.error(JSON.parse(err.body).error.data.reason);
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
	try {
		const gasLimit = await Buttholes.estimateGas.updateCheekSpreader(address.toString(), donor1.toString(), donor2.toString(), donor3.toString());
		const tx = await Buttholes.updateCheekSpreader(address, donor1, donor2, donor3, {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.debug(receipt);
		console.log("Successfully Added Donors!");
	}
	catch (err) {
		// console.error(err);
		console.warn("Unable to add new donors!");
		console.error(JSON.parse(err.body).error.data.reason);
	}
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 */
async function renounceButthole() {
	console.log("Renouncing Butthole from Contract: %s", account);
	const gasLimit = await Buttholes.estimateGas.renounceButthole();
	const tx = await Buttholes.renounceButthole({'gasLimit':gasLimit});
	try {
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerDown");
		if (event) {
			// console.debug(event);
			console.log("Successfully Renounced Butthole: %s", account);		
		}
		else
			console.warn("Failed to renounce butthole!");
	}
	catch (err) {
		// console.error(err);
		console.warn("Unable to renounce butthole!");
		console.error(JSON.parse(err.body).error.data.reason);
	}
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

// IPFS //

const IPFS_BUTTHOLES = "/nfts/buttholes",
	  IPFS_METADATA = "/nfts/buttholes/metadata",
	  IPFS_IMAGES = "/nfts/buttholes/images";

async function createIPFS() {
	console.log("Creating IPFS Folder Structure");
	try {
		await IPFS.files.mkdir(IPFS_METADATA, { parents: true })
		await IPFS.files.mkdir(IPFS_IMAGES, { parents: true })
	}
	catch (err) {_ipfsError(err);}
}

function _ipfsError(err) {
	console.warn("check IPFS daemon!");
	console.error(err.message);
	process.exit(1);
}

/**
 * @dev Check if artist name exists already in IPFS.
 * @param butthole An object containing nft metadata.
 */
async function findButthole(butthole, i=0) {
	console.debug("checking for preexisting butthole...");
	let existingButtholes = [];
	try {
		// const metadataDir = await IPFS.files.stat(IPFS_METADATA);
		// console.debug(metadataDir);
		for await (const file of IPFS.files.ls(IPFS_METADATA)) {
		  console.log(`${file.name} vs ${butthole.properties.name.value}`);
		  console.debug(file);
		  if (file.name == butthole.properties.name.value)
		  	existingButtholes.push(file);
		}
	  	console.debug("preexisting butthole nfts found: %s", existingButtholes.length);
	}
	catch (err) {
		if (err.message == "file does not exist" && i == 0) {
			await createIPFS();
			return findButthole(butthole, 1);
		}
		_ipfsError(err);
	}
	console.debug("preexisting butthole nft not found!");
	return existingButtholes;
}

/**
 * @dev Uploads content to IPFS: image first then combined metadata.json + image hash / CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButthole(butthole) {
	butthole.properties.butthole.value = await uploadButtholeImage(butthole);
	return await uploadButtholeMetadata(butthole);
}

/**
 * @dev Upload a butthole's jpeg/png file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeImage(butthole) {
	let image = path.resolve(__dirname, "../", butthole.properties.butthole.value);
	image = new Uint8Array(readFileSync(image));
	console.debug("uploading butthole image: %s", butthole.properties.butthole.value);
	const file = {
	  path: IPFS_IMAGES,
	  content: image
	}
	try {
		const { cid } = await IPFS.add(file);
		console.log("Butthole Image Added to IPFS: %s", cid.toString());
		await IPFS.files.write(`${IPFS_IMAGES}/${butthole.properties.name.value}`, image, {'create':true});
		console.log("Butthole Image Written to IPFS: %s", butthole.properties.name.value);
		return cid.toString();
	}
	catch (err) {_ipfsError(err);}
}

/**
 * @dev Upload a butthole's metadata.json file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeMetadata(butthole) {
	console.debug("uploading butthole metadata: %s\n%s", butthole.properties.name.value, JSON.parse(JSON.stringify(butthole),null,4));
	const file = {
	  name: butthole.properties.name.value,
	  path: IPFS_METADATA,
	  content: JSON.stringify(butthole),
	}
	try {
		const { cid } = await IPFS.add(file);
		console.log("Butthole Metadata Added to IPFS: %s", cid.toString());
		await IPFS.files.write(`${IPFS_METADATA}/${butthole.properties.name.value}`, JSON.stringify(butthole), {'create':true});
		console.log("Butthole Metadata Written to IPFS: %s", butthole.properties.name.value);
		return cid.toString();
	}
	catch (err) {_ipfsError(err);}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Create and add a new butthole NFT. Update edition number if artist already exists.
 * @param butthole An object containing nft metadata.
 */
async function add(butthole) {
	const d = butthole.donors; 
	butthole = createButtholeMetadata(butthole);
	butthole.donors = d;

	
	// check if butthole already exists in metadata collection
	let existingButtholes = await findButthole(butthole);

	if (existingButtholes.length > 0) {

		async function _getLatestButthole(buttholes) {
			if (buttholes.length == 1) return buttholes[0];
			let latestButthole = buttholes[1];
			for (let butt of buttholes) {
				const chunks = [];
				for await (const chunk of IPFS.cat(buttholeCID.cid))
				  chunks.push(chunk)
				butt = JSON.parse(Buffer.from(Buffer.concat(chunks)).toString('utf8'));

				let edition1 = butt.attributes.filter(obj => {return obj["trait_type"] === "edition"});
				let edition2 = latestButthole.attributes.filter(obj => {return obj["trait_type"] === "edition"});

				console.log("edition1 vs edition2: %s - %s", edition1, edition2);

				if (parseInt(edition1) > parseInt(edition2))
					latestButthole = butt;
			}
			return latestButthole;
		}
		let latestButthole = await _getLatestButthole(existingButtholes);
        console.log(`Butthole Artist \"${butthole.properties.name.value}\" already exists.`);
        console.log(`Latest Edition #: ${butthole.attributes.filter(obj => {if (obj["trait_type"] === "edition") return obj.value})[0].value}`);
		const answer = await askQuestion("Add new edition? yes/[n]o: ");
		if (answer.includes("y")) {
			console.log ("Adding new " + butthole.properties.name.value);
			butthole.attributes.map(a => {if (a["trait_type"] == "edition") a["value"] = parseInt(a["value"]) + 1 });
		}
		else {
			console.log ("Not adding new " + butthole.properties.name.value);
			return;
		}
	}
	else
		console.log(`Adding new Butthole Artist: ${butthole.properties.name.value} - ${butthole.properties.artist.value}`);
	// console.debug(butthole)
	buttholeCID = await uploadButthole(butthole);

	process.exit(0);

	await addButthole(butthole.properties.artist.value, buttholeCID);
	if (butthole.donors.length > 0)
		await donors(butthole);
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
	await addDonors(butthole.properties ? butthole.properties.artist.value : butthole.artist, donor1, donor2, donor3);
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