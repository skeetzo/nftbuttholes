// Access functions for IPFS

const { create } = require('ipfs-http-client');
const IPFS = create();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

////////////////////////////////////////////////////////////////////////////////////

const IPFS_BUTTHOLES = "/nfts/buttholes",
	  IPFS_METADATA = "/nfts/buttholes/metadata",
	  IPFS_IMAGES = "/nfts/buttholes/images";
	  
/**
 * @dev Check for required IPFS directories.
 */
async function checkIPFS() {
	console.log("Checking IPFS dir structure...")
	try {
		let dir0 = await ipfs.files.stat(IPFS_BUTTHOLES);
		let dir1 = await ipfs.files.stat(IPFS_METADATA);
		let dir2 = await ipfs.files.stat(IPFS_IMAGES);
		console.debug(dir0);
		console.debug(dir1);
		console.debug(dir2);
		if (dir0.hash&&dir1.hash&&dir2.hash) {
			console.debug("Found IPFS directories!");
			return true;
		}
	}
	catch (err) {
		console.warn("Unable to find IPFS directories!");
		_ipfsError(err);
	}
	console.warn("Unable to find IPFS directories!");
	return false;
}

/**
 * @dev Create IPFS directories.
 */
async function createIPFS() {
	console.log("Creating IPFS dir structure...");
	try {
		await IPFS.files.mkdir(IPFS_METADATA, { parents: true });
		await IPFS.files.mkdir(IPFS_IMAGES, { parents: true });
		console.debug("Created IPFS directories!");
	}
	catch (err) {
		console.warn("Unable to create IPFS directories!");
		_ipfsError(err);
	}
}

/**
 * @dev Prepare IPFS.
 */
async function prepareIPFS() {
	if (!await checkIPFS())
		await createIPFS();
}

/**
 * @dev Return from IPFS calls and end process if no connection.
 * @param err The error object.
 */
function _ipfsError(err) {
	console.error("IPFS error: "+err.message);
	console.warn("Check IPFS daemon!");
	process.exit(1);
}

////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Check if butthole NFT already exists. Prompt to confirm updating edition.
 * @param butthole An object containing nft metadata.
 */
async function checkExistingButtholes(butthole) {
	// check if butthole already exists in metadata collection
	let existingButtholes = await _findButthole(butthole);
	if (existingButtholes.length > 0) {
		async function _getLatestButthole(buttholes) {
			if (buttholes.length == 1) return buttholes[0];
			let latestButthole = buttholes[1];
			for (let butt of buttholes) {
				const chunks = [];
				for await (const chunk of IPFS.cat(buttholeCID.cid))
				  chunks.push(chunk)
				butt = JSON.parse(Buffer.from(Buffer.concat(chunks)).toString('utf8'));

				let edition1 = butt.properties.edition.value;
				let edition2 = latestButthole.properties.edition.value;

				console.log("edition1 vs edition2: %s - %s", edition1, edition2);

				if (parseInt(edition1) > parseInt(edition2))
					latestButthole = butt;
			}
			return latestButthole;
		}
		let latestButthole = await _getLatestButthole(existingButtholes);
        console.log(`Butthole Artist \"${butthole.properties.name.value}\" already exists.`);
        console.log(`Latest Edition #: ${latestButthole.properties.edition.value}`);
        // https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-js
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
		const answer = await askQuestion("Add new edition? yes/[n]o: ");
		if (answer.includes("y")) {
			console.log ("Adding new edition for " + butthole.properties.name.value);
			butthole.properties.edition.value = parseInt(butthole.properties.edition.value) + 1;
		}
		else 
			console.log(`(re)Adding existing Butthole: ${butthole.properties.name.value} - ${butthole.properties.artist.value}`);
	}
	return butthole;
}

/**
 * @dev Check if artist name exists already in IPFS.
 * @param butthole An object containing nft metadata.
 */
async function _findButthole(butthole, i=0) {
	console.debug("checking for preexisting butthole...");
	let existingButtholes = [];
	try {
		// const metadataDir = await IPFS.files.stat(IPFS_METADATA);
		// console.debug(metadataDir);
		for await (const file of IPFS.files.ls(IPFS_METADATA)) {
		  console.log(`${file.name} vs ${butthole.properties.name.value}`);
		  console.debug(file);
		  if (file.name == butthole.properties.name.value+"-"+butthole.properties.edition.value+".json")
		  	existingButtholes.push(file);
		}
	  	console.debug("preexisting butthole nfts found: %s", existingButtholes.length);
	}
	catch (err) {
		if (err.message == "file does not exist" && i == 0) {
		  await prepareIPFS();
		  return await _findButthole(butthole, 1);
		}
		_ipfsError(err);
	}
	console.debug("preexisting butthole nft not found!");
	return existingButtholes;
}

/**
 * @dev Get the butthole NFT metadata from IPFS.
 * @param buttholeURI The butthole NFT to get.
 */
async function getButtholeFromIPFS(buttholeURI) {
	let uri = await IPFS.cat(buttholeURI);
	console.debug("uri: "+uri);
	// return uri;
	return JSON.parse(uri);
}

/**
 * @dev Get the butthole NFT image from IPFS.
 * @param buttholeURI The butthole NFT to get.
 */
async function getButtholeImageFromIPFS(buttholeURI) {
	let file = await IPFS.cat(buttholeURI);
	file = file.toString("base64");
	// for (const value of file) {
		// console.log(value)
	// }
	return file;
	// return file.toString("base64");
}

/**
 * @dev Upload a butthole's jpeg/png file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeImage(butthole) {
	try {
		fs.openSync(butthole.properties.butthole.value);
	}
	catch (err) {
		console.error(err);
		throw "Butthole image file must exist to upload!";
	}
	let image = new Uint8Array(fs.readFileSync(butthole.properties.butthole.value));
	console.debug("uploading butthole image: %s", butthole.properties.butthole.value);
	const file = {
	  name: butthole.properties.name.value+"-"+butthole.properties.edition.value,
	  path: IPFS_IMAGES,
	  content: image
	}
	try {
		const { cid: imageCid } = await IPFS.add(file);
		console.log("Successfully added butthole image to IPFS: %s (edition: %s)", imageCid, butthole.properties.edition.value);
		await IPFS.files.write(`${IPFS_IMAGES}/${butthole.properties.name.value}-${butthole.properties.edition.value}`, image, {'create':true});
		console.log("Successfully wrote butthole image to IPFS: %s", butthole.properties.name.value);
		return imageCid.toString();
	}
	catch (err) {_ipfsError(err);}
}

/**
 * @dev Upload a butthole's metadata.json file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function _uploadButtholeMetadata(butthole) {
	console.debug("uploading butthole metadata: %s\n%s", butthole.properties.name.value, JSON.parse(JSON.stringify(butthole),null,4));
	const file = {
	  name: butthole.properties.name.value+"-"+butthole.properties.edition.value+".json",
	  path: IPFS_METADATA,
	  content: JSON.stringify(butthole),
	}
	try {
		const { cid: metadataCid } = await IPFS.add(file);
		console.log("Successfully added butthole metadata to IPFS: %s (edition: %s)", metadataCid, butthole.properties.edition.value);
		await IPFS.files.write(`${IPFS_METADATA}/${butthole.properties.name.value}-${butthole.properties.edition.value}.json`, JSON.stringify(butthole), {'create':true});
		console.log("Successfully wrote butthole metadata to IPFS: %s", butthole.properties.name.value);
		return metadataCid.toString();
	}
	catch (err) {_ipfsError(err);}
}

/**
 * @dev Uploads content to IPFS: image first then combined metadata.json + image hash / CID.
 * @param butthole An object containing artist nft metadata.
 */
async function uploadButthole(butthole) {
	try {
		butthole.properties.butthole.value = await uploadButtholeImage(butthole);
		return await _uploadButtholeMetadata(butthole);
	}
	catch (err) {
		console.error(err);
	}
	return "";
}

module.exports = {
	checkExistingButtholes,
	getButtholeFromIPFS,
	getButtholeImageFromIPFS,
	uploadButthole,
	uploadButtholeImage
}