// Access functions for IPFS

const { concat } = require('uint8arrays');
const { create } = require('ipfs-http-client');
const IPFS = create();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

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

////////////////////////////////////////////////////////////////////////////////////

const IPFS_BUTTHOLES = "/nfts/buttholes",
	  IPFS_METADATA = "/nfts/buttholes/metadata",
	  IPFS_IMAGES = "/nfts/buttholes/images";

const FILE_OPTIONS = {'create':true,'parents':true,
// 'wrapWithDirectory':true
};

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
	let recentButthole = await findMostRecent(butthole);
	if (!recentButthole) return;
    console.log(`Butthole Artist \"${butthole.properties.name.value}\" already exists.`);
    // console.debug(recentButthole)
    console.log(`Latest Edition #: ${recentButthole.properties.edition.value}`);
	const answer = await askQuestion("Add new edition? yes/[n]o: ");
	if (answer.includes("y")) {
		console.log ("Adding new edition for " + butthole.properties.name.value);
		butthole.properties.edition.value = parseInt(butthole.properties.edition.value) + 1;
	}
	else {
		console.log(`Existing Butthole: ${butthole.properties.name.value} - ${butthole.properties.artist.value}`);
		process.exit(0);
	}
}

/**
 * @dev Check if artist name exists already in IPFS.
 * @param butthole An object containing nft metadata.
 */
async function findMostRecent(butthole, i=0) {
	console.debug("checking for preexisting butthole...");
	let existingButtholes = [];
	let latestButthole = butthole;
	try {
		// const metadataDir = await IPFS.files.stat(IPFS_METADATA);
		// console.debug(metadataDir);
		for await (const file of IPFS.files.ls(IPFS_METADATA)) {
		  console.log(`${file.name} vs ${butthole.properties.name.value}-${butthole.properties.edition.value}.json`);
		  // console.debug(file);
		  if (file.name == butthole.properties.name.value+"-"+butthole.properties.edition.value+".json")
		  	existingButtholes.push(file);
		}
		if (existingButtholes.length == 0) {
			console.debug("preexisting butthole nft not found!");
			return latestButthole;
		}
	  	console.debug("preexisting butthole nfts found: %s", existingButtholes.length);
		latestButthole = existingButtholes[existingButtholes.length-1];
	  	for (let butt of existingButtholes) {
	  		// console.debug(butt)
	  		// console.debug(butt.cid)
			const chunks = [];
			for await (const chunk of IPFS.cat(butt.cid.toString()))
			  chunks.push(chunk)
			try {
				butt = JSON.parse(Buffer.from(Buffer.concat(chunks)).toString('utf8'));
			}
			catch (err) {
				console.error(err);
				throw "Unable to parse IPFS metadata!";
			}
			if (existingButtholes.length == 1) return butt;
			let edition1 = butt.properties.edition.value;
			let edition2 = latestButthole.properties.edition.value;
			console.log("edition1 vs edition2: %s - %s", edition1, edition2);
			if (parseInt(edition1) > parseInt(edition2))
				latestButthole = butt;
		}
	}
	catch (err) {
		// if (err.message == "file does not exist" && i == 0) {
		  // await prepareIPFS();
		  // return await findMostRecent(butthole, 1);
		// }
		_ipfsError(err);
	}
	return latestButthole;
}

/**
 * @dev Return the IPFS data at CID.
 * @param cid The resource to fetch.
 */
async function _getData(cid) {
	let chunks = [];
	try {
		for await (const chunk of IPFS.cat(cid)) {
	     chunks.push(chunk);
		}
		return concat(chunks);
	}
	catch (err) {
		console.warn(`Warning: ${err.message}`);
	}
	chunks = [];
	for await (const chunk of IPFS.get(cid)) {
		chunks.push(chunk);
	}
	// return data;
	return concat(chunks);
}

/**
 * @dev Get the butthole NFT metadata from IPFS.
 * @param cid The butthole NFT to get.
 */
async function getButtholeFromIPFS(cid) {
	let data = new TextDecoder().decode(await _getData(cid)).toString();
	// BUG FIX
	// data returns weird, not sure what to do
	// prune at first occasion of '{'
	if (data.toString().indexOf("{")-1>-1)
		data = JSON.stringify(data.toString().substring(data.toString().indexOf("{")-1));
	// console.log(data);
	return JSON.parse(data);
}

/**
 * @dev Get the butthole NFT image from IPFS.
 * @param cid The butthole NFT to get.
 */
async function getButtholeImageFromIPFS(cid) {
	const file = await _getData(cid);
	return file.toString("base64");
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
	  path: IPFS_IMAGES+"/"+butthole.properties.name.value+"-"+butthole.properties.edition.value,
	  content: image
	}
	try {
		const { cid: cid } = await IPFS.add(file);
		console.log("Successfully added image to IPFS: %s", cid);
		await IPFS.files.write(`${IPFS_IMAGES}/${butthole.properties.name.value}-${butthole.properties.edition.value}`, image, FILE_OPTIONS);
		console.log("Successfully wrote image to IPFS: %s", butthole.properties.name.value);
		return cid.toString();
	}
	catch (err) {_ipfsError(err);}
}

/**
 * @dev Upload a butthole's metadata.json file and return the CID.
 * @param butthole An object containing nft metadata.
 */
async function uploadButtholeMetadata(butthole) {
	// console.debug("uploading butthole metadata: %s\n%s", butthole.properties.name.value, JSON.parse(JSON.stringify(butthole),null,4));
	console.debug("uploading butthole metadata: %s", butthole.properties.name.value);
	const file = {
	  name: butthole.properties.name.value+"-"+butthole.properties.edition.value+".json",
	  path: IPFS_METADATA+"/"+butthole.properties.name.value+"-"+butthole.properties.edition.value+".json",
	  content: JSON.stringify(butthole),
	}
	try {
		const { cid: cid } = await IPFS.add(file);
		console.log("Successfully added metadata to IPFS: %s", cid);
		await IPFS.files.write(`${IPFS_METADATA}/${butthole.properties.name.value}-${butthole.properties.edition.value}.json`, JSON.stringify(butthole), FILE_OPTIONS);
		console.log("Successfully wrote metadata to IPFS: %s", butthole.properties.name.value);
		return cid.toString();
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
		return await uploadButtholeMetadata(butthole);
	}
	catch (err) {
		console.error(err);
	}
	return "";
}

module.exports = {
	checkExistingButtholes,
	findMostRecent,
	getButtholeFromIPFS,
	getButtholeImageFromIPFS,
	uploadButthole,
	uploadButtholeImage,
	uploadButtholeMetadata
}