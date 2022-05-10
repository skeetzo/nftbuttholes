#!/usr/bin/env node
// Add, update, or renounce a butthole NFT.

require('dotenv').config();
// const { Command } = require('commander');
const commander = require('commander'),
	  Command = commander.Command;
// var argv = require('minimist')(process.argv.slice(2),{'string':['a','b','d','n','i']});
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

let Buttholes; // connected ETH account & NFT contract

/**
 * @dev Connects to Butthole contract via provided Web3.0 url.
 */
async function connectToContract() {
	try {
		var url = process.env.ETHEREUM_NODE || "http://localhost:8545";
		console.log("Connecting to Ethereum node @ %s", url)
		var web3Provider = new ethers.providers.JsonRpcProvider(url);
		const signer = web3Provider.getSigner();
		// account = await signer.getAddress();
		// console.debug("Connected Account: %s", account);
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
	if (!Buttholes) Buttholes = await connectToContract();
	console.log("Adding butthole to contract: %s -> %s", newButtholeAddress, newButtholeURI);
	try {
		const gasLimit = await Buttholes.estimateGas.addButthole(newButtholeAddress.toString(), newButtholeURI.toString());
		const tx = await Buttholes.addButthole(newButtholeAddress.toString(), newButtholeURI.toString(), {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			// console.debug(event);
			console.log(`Successfully added butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
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
 * @dev Adds starving artists for the provided ETH address.
 * @param address The artist's ETH address.
 * @param donor1 The 1st donation address.
 * @param donor2 The 2nd donation address.
 * @param donor3 The 3rd donation address.
 */
async function addStarvingArtists(address, donor1, donor2, donor3) {
	if (!Buttholes) Buttholes = await connectToContract();
	console.log("Adding starving artists to contract for address: %s\n-> %s\n-> %s\n-> %s", address, donor1, donor2, donor3);
	try {
		const gasLimit = await Buttholes.estimateGas.updateCheekSpreader(address.toString(), donor1.toString(), donor2.toString(), donor3.toString());
		const tx = await Buttholes.updateCheekSpreader(address, donor1, donor2, donor3, {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.debug(receipt);
		console.log("Successfully added starving artists!");
	}
	catch (err) {
		// console.error(err);
		console.warn("Unable to add new starving artists!");
		console.error(JSON.parse(err.body).error.data.reason);
	}
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 */
async function renounceButthole() {
	if (!Buttholes) Buttholes = await connectToContract();
	console.log("Renouncing butthole from contract...");
	const gasLimit = await Buttholes.estimateGas.renounceButthole();
	const tx = await Buttholes.renounceButthole({'gasLimit':gasLimit});
	try {
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerDown");
		if (event) {
			// console.debug(event);
			console.log("Successfully renounced butthole!");		
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
	console.warn("Check IPFS daemon!");
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
		console.log("Successfully added butthole image to IPFS: %s", cid.toString());
		await IPFS.files.write(`${IPFS_IMAGES}/${butthole.properties.name.value}`, image, {'create':true});
		console.log("Successfully wrote butthole image to IPFS: %s", butthole.properties.name.value);
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
		console.log("Successfully added butthole metadata to IPFS: %s", cid.toString());
		await IPFS.files.write(`${IPFS_METADATA}/${butthole.properties.name.value}`, JSON.stringify(butthole), {'create':true});
		console.log("Successfully wrote butthole metadata to IPFS: %s", butthole.properties.name.value);
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
	const d = butthole.starvingArtists; 
	butthole = createButtholeMetadata(butthole);
	butthole.starvingArtists = d;

	
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
	if (butthole.starvingArtists.length > 0)
		await starvingArtists(butthole);
}

/**
 * @dev Update a butthole NFT's CheekSpreader contract data.
 * @param butthole An object containing nft metadata.
 */
async function starvingArtists(butthole) {
	console.log("Updating starving artists...");
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
	await addStarvingArtists(butthole.properties ? butthole.properties.artist.value : butthole.artist, artist1, artist2, artist3);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Add, update, or renounce a butthole NFT.
 */
(async function main() {

	const program = new Command();

	const butthole = {
		artist : "",
		image : "",
		name : "",
		description : "",
		birthday : "",
		starvingArtists : []
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
	  	await starvingArtists(butthole);
	  });

	program.command('renounce')
	  .description('Renounce your butthole.')
	  .action(renounceButthole);

	await program.parseAsync(process.argv);

})();