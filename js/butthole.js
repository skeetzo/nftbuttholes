require('dotenv').config();
const { readFileSync } = require('fs');
// import * as IPFS from 'ipfs';
// const { IPFS } = require('ipfs-core');

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


const birthday = '2022-06-22';

const _defaultOptions = {
	'artist': "",
	'birthday': "",
	'buttholeHash': ""
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addButthole(options) {
	// check if butthole already exists in metadata collection
	// if does not exist yet:
		// create new butthole & upload
	// if already exists:
		// check IPFS for existing metadata CID?
		// output duplicate error?
		// return existing CID?
}

function backupButthole(butthole) {
	// save nft metadata locally
}

function deleteButthole(options) {
	// same as above but reverse?
}

// create a butthole NFT's metadata
function createButtholeNFT(options) {

	// load default metadata.json and update default values
	const nft = _getDefaultMetadata();

	// update birthday
	const date = new Date(options.birthday);
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	console.log("Birthdate: %s --> %s", dateStr, unixTimestamp);
	nft.attributes.birthday = unixTimestamp;
	// update image
	nft.properties.image.value = options.buttholeHash;
	return nft;
}

function addDonors(butthole, donor1, donor2, donor3) {
	// add donors for butthole
	contract.createCheekSpreader(donor1, donor2, donor3)
}

function _getDefaultMetadata() {

	const nft = fs.readFileSync('../docs/metadata.json', 'utf8')

	nft.animation_url = process.env.DEFAULT_ANIMATION_URI

	const date = new Date();
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	nft.attributes.birthday = unixTimestamp;

	// Base
	// Eye
	// Mouth
	// Level
	nft.attributes.Level.value = 1;
	// Stamina
	nft.attributes.Stamina.value = 6;

	// artist
	nft.properties.artist.value = "";
	// name
	nft.properties.name.value = "";
	// description
	nft.properties.description.value = "";
	// image
	nft.properties.image.value = process.env.DEFAULT_IMAGE_URI
	// placeholder
	nft.properties.placeholder.value = process.env.DEFAULT_PLACEHOLDER_URI

	return nft;
}


async function uploadButtholeToIPFS(butthole) {

	const node = 0;
	// const node = await IPFS.create()

	// add your data to to IPFS - this can be a string, a Buffer,
	// a stream of Buffers, etc
	const results = node.add(JSON.stringify(butthole))

	// we loop over the results because 'add' supports multiple 
	// additions, but we only added one entry here so we only see
	// one log line in the output
	for await (const { cid } of results) {
	  // CID (Content IDentifier) uniquely addresses the data
	  // and can be used to get it again.
	  console.log(cid.toString())
	}
	console.log("-- Butthole Added to IPFS --");
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Steps for creating an NFT w/ matching metadata.json uploaded to IPFS:
// createButtholeNFT(options) (-> _getDefaultMetadata() ->) buttholeNFT -> uploadButtholeToIPFS(buttholeNFT) -> metadataHash -> contract.addButthole(options, metadataHash)
// - create a new metadata.json if one does not exist already
// - update it with new data for the new butthole "artist"
// - backup the .json file locally
// - upload the newly created metadata.json file to IPFS
// --
// - call the contract to add a new butthole with the address for them + their newly created metadata.json hash
// - call the contract to update their donor lists


// Steps for Progressing Mint "phases":
// - increase Edition by 1

var argv = require('minimist')(process.argv.slice(2));
console.log(argv);

// {
// 	// Required //
// 	artists ETH address
// 	/file/path/butthole.jpeg

// 	// OPTIONAL //
// 	birthday

// 	donor1 address
// 	donor2 address
// 	donor3 address

// 	// joke values
// 	...
// }






// node buttholes.js --add
// --cheeks -> donors -> createCheekSpreader
// --renounce
