require('dotenv').config();
var argv = require('minimist')(process.argv.slice(2));
const ethers = require('ethers');
const { readFileSync } = require('fs');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

// adds a new butthole account
// requires:
// 	- Ethereum account
// #	- butthole pic (jpg, jpeg, png, etc)
// 	- [OPTIONAL] 3 alternate donation addresses

// 1) prepare Ethereum account address
// - save in spreadsheet or something similar

// 2) prepare butthole jpeg for long term storage
// - add image to ipfs, get file hash CID

// 3) add new butthole
// - send tx to Buttholes contract via addButthole(newButthole, _tokenURI)
// 	newButthole --> an Ethereum address that represents a person
// 	_tokenURI 	--> the newly generated ipfs CID

// 4) update the donors / CheekSpreader
// - send tx to Buttholes contract via createCheekSpreader(donor1, donor2, donor3)
// - retrieve donor1, 2, & 3 from .env

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let account, Buttholes;

async function connectToContract() {
	var url = process.env.ETHEREUM_NODE || "127.0.0.1";
	var web3Provider = new ethers.providers.JsonRpcProvider(url);
	const signer = web3Provider.getSigner();
	account = await signer.getAddress();
	console.log("Connected Account: %s", account);
	const ButtholesInterface = require('../build/contracts/Buttholes.json');
	const abi = ButtholesInterface.abi;
	const { chainId } = await web3Provider.getNetwork();
	console.log("Chain ID: %s", chainId); // 42
	const address = ButtholesInterface.networks[chainId].address;
	console.log("Contract Address: %s", address);
	Buttholes = new ethers.Contract(address, abi, signer);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Contract //

// TODO
// test contract interaction
async function addButthole(newButtholeAddress, newButtholeURI) {
	console.log("Adding Butthole to Contract: %s -> %s", newButtholeAddress, newButtholeURI);
	const tx = await Buttholes.addButthole(newButtholeAddress, newButtholeURI);
	try {
		const receipt = await tx.wait();
		// const event = receipt.events.find(x => x.event === "PuckerUp");
		// if (event) {
			console.log(`Successfully Added Butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		// }
	}
	catch (err) {
		console.error("Unable to add new butthole!");
		console.log(err);
		console.debug(err);
	}
}

// TODO
// test contract interaction
// must be run by owner of account
async function addDonors(donor1, donor2, donor3) {
	console.log("Adding Donors to Contract:\n-> %s\n-> %s\n-> %s]", donor1, donor2, donor3);
	// add donors for butthole
	const tx = await Buttholes.createCheekSpreader(donor1, donor2, donor3);
	try {
		const receipt = await tx.wait();
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			console.log(`Successfully Added Donors: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		console.error("Unable to add new donors!");
	}
	catch (err) {
		console.error("Unable to add new donors!");
		console.log(err);
		console.debug(err);
	}
}

// TODO
// test contract interaction
// must be run by owner of account
function renounceButthole() {
	console.log("Renouncing Butthole from Contract: %s", account);
	const tx = await Buttholes.renounceButthole();
	try {
		const receipt = await tx.wait();
		console.log("Successfully Renounced Butthole: %s", account);		
	}
	catch (err) {
		console.error("Unable to renounce butthole!");
		console.log(err);
		console.debug(err);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// IPFS //

// return skeleton {} metadata
function _getDefaultMetadata() {
	const nft = readFileSync('../docs/metadata.json', 'utf8')
	nft.animation_url = process.env.DEFAULT_ANIMATION_URI
	const date = new Date();
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	nft.attributes.birthday = unixTimestamp;
	// Attributes //
	// Base
	// Eye
	// Mouth
	// Level
	nft.attributes.level.value = 0;
	// Stamina
	nft.attributes.stamina.value = 0;
	// Properties //
	// artist
	nft.properties.artist.value = "";
	// name
	nft.properties.name.value = "";
	// description
	nft.properties.description.value = "";
	// image
	nft.properties.image.value = process.env.DEFAULT_PLACEHOLDER_URI
	// butthole
	nft.properties.butthole.value = process.env.DEFAULT_PLACEHOLDER_URI
	return nft;
}

// create a butthole NFT's metadata
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
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	nft.attributes.birthday = unixTimestamp;
	nft.attributes.level = _getAge(butthole.birthday);
	console.log(`Birthday: (${nft.attributes.level}) ${dateStr} --> ${nft.attributes.birthday}`);
	// update values
	nft.attributes.edition = butthole.edition; 
	nft.properties.artist.value = butthole.artist;
	nft.properties.name.value = butthole.name;
	nft.properties.description.value = butthole.description;
	nft.properties.butthole.value = butthole.image;
	return nft;
}

// check if artist name exists already in IPFS
async function findButthole(butthole) {
	const cid = '/nft/buttholes/metadata';
	for await (const file of ipfs.ls(cid))
	  if (file.name == butthole.name)
	  	return file;
	return false;
}

// uploads content to IPFS: image first then combined metadata.json + image hash
async function uploadButthole(butthole) {
	butthole.properties.image = await uploadButtholeImage(butthole.image);
	return await uploadButtholeMetadata(butthole);
}

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
			butthole.edition = parseInt(butthole.edition) + 1;
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
}

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
	await addDonors(donor1, donor2, donor3);
}
async function update(butthole) {
	console.log("Updating Butthole...");
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Final goal:
// 1 function to be ran that accepts: ETH address for new butthole account + path to local butthole jpeg 
// -> uploads image and metadata to IPFS
// -> anyone can then mint the newly available butthole

// Steps for creating an NFT w/ matching metadata.json uploaded to IPFS:
// createButtholeNFT(options) (-> _getDefaultMetadata() ->) buttholeNFT -> uploadButtholeToIPFS(buttholeNFT) -> metadataHash -> contract.addButthole(options, metadataHash)
// - have available: 1 Ethereum address & 1 butthole jpeg/png
// - check if metadata.json / butthole image for butthole nft exists already
// - upload butthole image to IPFS if not uploaded
// - create a new metadata.json if one does not exist already
// - update it with new data for the new butthole "artist"
// - upload the newly created metadata.json file to IPFS
// --
// - call the contract to add a new butthole with the address for them + their newly created metadata.json hash
// - call the contract to update their donor lists


// Steps for Progressing Mint "phases":
// - increase Edition by 1


// --add

// a = artist ETH address
// b = artist birthday
// d = artist description
// n = artist name
// i = path/butthole.jpeg

// node butthole.js --add -a "0xaddress" -i "/path/to/butthole.jpeg" -b "6/6/1990" -d "A wily one." -n "Alex D." 
// node butthole.js --add -a "0xaddress" -i "/path/to/butthole.jpeg" -b "6/6/1990" -d "A wily one." -n "Alex D." -a "0xaddress1" -a "0xaddress2" -a "0xaddress3"


// --donors

// a = artist ETH address
// 1 = donor 1
// 2 = donor 2
// 3 = donor 3

// node butthole.js --donors -a "0xaddress" -a "0xaddress1" -a "0xaddress2" -a "0xaddress3"

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(async function main() {
	console.debug(argv);

	const artistAddress = argv["a"].shift();
	let donorAddresses = [];
	while (argv["a"].length > 0)
		donorAddresses.push(argv["a"].shift());
	const butthole = {
		artist : artistAddress,
		birthday : argv["b"],
		description : argv["d"],
		donors : donorAddresses,
		name : argv["n"],
		image : argv["i"]
	};

	if (!argv["add"]&&!argv["donors"]&&!argv["update"]) return console.error("Missing runtime command!");

	await connectToContract();

	// adds new butthole
	if (argv["add"])
		await add(butthole);
	// updates 3 donors
	else if (argv["donors"])
		await donors(butthole);
	// updates token URI
	else if (argv["update"]) 
		await update(butthole);
})();