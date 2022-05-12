// Access functions for IPFS

const { create } = require('ipfs-http-client');
const IPFS = create();
const path = require('path');
const { readFileSync } = require('fs');
const readline = require('readline');

////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////

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
			butthole.attributes.map(a => {if (a["trait_type"] == "edition") a["value"] = parseInt(a["value"]) + 1 });
		}
		else {
			console.log ("Not adding new " + butthole.properties.name.value);
			throw "Existing Butthole found!";
		}
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
		  if (file.name == butthole.properties.name.value+".json")
		  	existingButtholes.push(file);
		}
	  	console.debug("preexisting butthole nfts found: %s", existingButtholes.length);
	}
	catch (err) {
		if (err.message == "file does not exist" && i == 0) {
			await createIPFS();
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
	return JSON.parse(await IPFS.files.cat(buttholeURI));
}

/**
 * @dev Get the butthole NFT image from IPFS.
 * @param buttholeURI The butthole NFT to get.
 */
async function getButtholeImageFromIPFS(buttholeURI) {
	let file = await IPFS.files.cat(buttholeURI);
	return file.toString("base64");
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
		const { cid: metadataCid } = await IPFS.add(file);
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
async function _uploadButtholeMetadata(butthole) {
	console.debug("uploading butthole metadata: %s\n%s", butthole.properties.name.value, JSON.parse(JSON.stringify(butthole),null,4));
	const file = {
	  name: butthole.properties.name.value,
	  path: IPFS_METADATA,
	  content: JSON.stringify(butthole),
	}
	try {
		const { cid: metadataCid } = await IPFS.add(file);
		console.log("Successfully added butthole metadata to IPFS: %s", cid.toString());
		await IPFS.files.write(`${IPFS_METADATA}/${butthole.properties.name.value}.json`, JSON.stringify(butthole), {'create':true});
		console.log("Successfully wrote butthole metadata to IPFS: %s", butthole.properties.name.value);
		return cid.toString();
	}
	catch (err) {_ipfsError(err);}
}

/**
 * @dev Uploads content to IPFS: image first then combined metadata.json + image hash / CID.
 * @param butthole An object containing artist nft metadata.
 */
async function uploadButthole(butthole) {
	butthole.properties.butthole.value = await uploadButtholeImage(butthole);
	return await _uploadButtholeMetadata(butthole);
}

module.exports = {
	getButtholeFromIPFS,
	getButtholeImageFromIPFS,
	uploadButthole,
	uploadButtholeImage
}