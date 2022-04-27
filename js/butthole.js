require('dotenv').config();


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

// create a butthole NFT's metadata
function createButtholeNFT(birthday) {

	const date = new Date(birthday);
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	console.log("Birthdate: %s --> %s", dateStr, unixTimestamp);

	// load default metadata.json and update default values
	let nft = {};
	// update defaults

	nft.animation_url = process.env.DEFAULT_ANIMATION_URI

	nft.attributes.birthdate = unixTimestamp

	Edition
	Base
	Eye
	Mouth
	Level
	Stamina

	artist
	name
	description
	image
	placeholder

	nft.properties.image = process.env.DEFAULT_IMAGE_URI
	nft.properties.placeholder = process.env.DEFAULT_PLACEHOLDER_URI

	return nft;
}

