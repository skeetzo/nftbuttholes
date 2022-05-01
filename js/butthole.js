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

// Contract //

// TODO
// finish contract interaction
async function addButthole(newButtholeAddress, newButtholeURI) {
	const tx = await Buttholes.addButthole(newButtholeAddress, newButtholeURI);
	const receipt = await tx.wait();
	const event = receipt.events.find(x => x.event === "PuckerUp");
	if (event) {
		console.log(`Butthole added: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
	}
	console.error("Unable to add new butthole!");
}

// TODO
// finish contract interaction
// update this to properly send from the correct account
// add method in contract for updating for people?
async function addDonors(donor1, donor2, donor3) {
	// add donors for butthole
	const tx = await Buttholes.createCheekSpreader(donor1, donor2, donor3);
	const receipt = await tx.wait();
	const event = receipt.events.find(x => x.event === "PuckerUp");
	if (event) {
		console.log(`Butthole added: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
	}
	console.error("Unable to add new butthole!");
}

// TODO
// decide if necessary / replace with renounce?
// function deleteButthole(options) {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// IPFS //

// return skeleton {} metadata
// TODO
// finish filling in variables
function _getDefaultMetadata() {

	const nft = fs.readFileSync('../docs/metadata.json', 'utf8')

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
	nft.attributes.Level.value = 1;
	// Stamina
	nft.attributes.Stamina.value = 6;

	// Properties //
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

// create a butthole NFT's metadata
function createButtholeNFT(hash, options) {
	// load default metadata.json and update default values
	const nft = _getDefaultMetadata();
	// update birthday
	const date = new Date(options.birthday);
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	console.log("Birthdate: %s --> %s", dateStr, unixTimestamp);
	nft.attributes.birthday = unixTimestamp;
	// update image
	nft.properties.image.value = hash;
	return nft;
}

// check if NFT metadata exists already in IPFS
// TODO
// do this to prevent (local?) duplicates
function findButthole(options) {}


// TODO
// finish methods for uploading content to IPFS: image & metadata.json
async function uploadButthole(butthole) {
	// upload a butthole image to IPFS
	// return CID of new butthole image
}
async function uploadMetadata(metadata) {

	const file = {
	  path: `/nfts/buttholes/${}/${}`,
	  // content: buttholeImage
      // content: ipfs.types.Buffer.from(btoa(fr.result),"base64")
	}

	const result = await ipfs.add(file)

	console.info(result)

	/*
	Prints:
	{
	  "path": "tmp",
	  "cid": CID("QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg"),
	  "mode": 493,
	  "mtime": { secs: Number, nsecs: Number },
	  "size": 67
	}
	*/

	const node = 0;
	// const node = await IPFS.create()
	// add your data to to IPFS - this can be a string, a Buffer, a stream of Buffers, etc
	const results = node.add(JSON.stringify(metadata))
	// we loop over the results because 'add' supports multiple 
	// additions, but we only added one entry here so we only see
	// one log line in the output
	for await (const { cid } of results) {
		// CID (Content IDentifier) uniquely addresses the data
		// and can be used to get it again.
		console.log("Butthole Added to IPFS: %s", cid.toString());
		return cid;
	}	
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


async function add() {
	// check if butthole already exists in metadata collection
	// if does not exist yet:
		// create new butthole & upload
	// if already exists:
		// check IPFS for existing metadata CID?
		// output duplicate error?
		// return existing CID?

	let newButtholeAddress = "",
		newButtholeURI = "";
	await addButthole(newButtholeAddress, newButtholeURI);
}





// node buttholes.js --add
// --cheeks -> donors -> createCheekSpreader
// --renounce







// npm install ipfs-http-client

// import { create } from 'ipfs-http-client'

// // connect to the default API address http://localhost:5001
// const client = create()

// // connect to a different API
// const client = create('http://127.0.0.1:5002')

// // connect using a URL
// const client = create(new URL('http://127.0.0.1:5002'))

// // call Core API methods
// const { cid } = await client.add('Hello world!')
