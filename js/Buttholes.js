// Access Functions for Smart Contract
// -> add, mint, update, renounce

/**
 * @dev Catch an error from a contract call.
 * @param revert An object containing reverted transaction data.
 */
function _catchRevert(revert) {
	if (revert.body&&revert.body.error&&revert.body.error.message)
		console.error(revert.body.error.message);
	console.error(revert);
	// console.error(JSON.parse(err.body).error.data.reason);
}

/**
 * @dev Adds a newly generated butthole NFT.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 * @param newButtholeAddress The artist's ETH address.
 * @param newButtholeURI The CID of the token's metadata.json on IPFS.
 */
async function add(Buttholes, newButtholeAddress, newButtholeURI) {
	console.log("Adding butthole to contract: %s -> %s", newButtholeAddress, newButtholeURI);
	try {
		const gasLimit = await Buttholes.estimateGas.addButthole(newButtholeAddress.toString(), newButtholeURI.toString());
		const tx = await Buttholes.addButthole(newButtholeAddress.toString(), newButtholeURI.toString(), {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.debug(receipt);
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			// console.debug(event);
			console.log(`Successfully added butthole!\n${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		else
			console.warn("Failed to add new butthole!");
	}
	catch (err) {
		console.warn("Unable to add new butthole!");
		_catchRevert(err);
		return false;
	}
	return true;
}

/**
 * @dev Adds a user to minting role aka 18+ access.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 */
async function confirm(Buttholes) {
	try {
		const gasLimit = await Buttholes.estimateGas.confirmAge();
		const tx = await Buttholes.confirmAge({'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.log(receipt.logs);
		const event = receipt.events.find(x => x.event === "RoleGranted");
		// console.debug(event);
		if (event)
			console.log(`Successfully added minting!\n${event.args.account}`);		    
		else
			console.log("Maybe added minting!");		    
	}
	catch (err) {
		console.warn("Unable to add new minter!");
		_catchRevert(err);
		return false;
	}
	return true;
};

async function getButtholeOwners() {
	try {
		return await Buttholes.buttholeOwners();
	}
	catch (err) {
		console.warn("Unable to get butthole owners!");
		_catchRevert(err);
	}
	return [];
}

async function getButtholeURI(Buttholes, address) {
	try {
		return await Buttholes.getButtholeURI(address);
	}
	catch (err) {
		console.warn("Unable to get butthole owners!");
		_catchRevert(err);
	}
	return null;
}

/**
 * @dev Check if address has admin role.
 * @param address The address to check.
 */
async function isAdmin(Buttholes, address) {
	try {
		return await Buttholes.hasRole(await Buttholes.DEFAULT_ADMIN_ROLE(), address);
	}
	catch (err) {
		console.warn("Unable to check if admin!");
		_catchRevert(err);
		return false;
	}
	return true;
}

/**
 * @dev Check if address has minter role.
 * @param address The address to check.
 */
async function isMinter(Buttholes, address) {
	try {
		return await Buttholes.hasRole(await Buttholes.MINTER_ROLE(), address);
	}
	catch (err) {
		console.warn("Unable to check if minter!");
		_catchRevert(err);
		return false;
	}
	return true;
}

/**
 * @dev Mints a butthole NFT.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 * @param to The address to receive the token.
 * @param butthole The id of the butthole to mint.
 */
async function mint(Buttholes, to, butthole) {
	console.log("Minting butthole to address: %s", to);
	try {
		const gasLimit = await Buttholes.estimateGas.mint(to, butthole);
		const tx = await Buttholes.mint(to, butthole, {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.debug(receipt);
		const event = receipt.events.find(x => x.event === "Transfer");
		if (event) {
			// console.debug(event);
			console.log(`Successfully minted butthole!\n${event.args.to} - ${event.args.tokenId}`);
		}
		else {
			console.warn("Failed to mint butthole!");
			return false;
		}
	}
	catch (err) {
		console.warn("Unable to mint butthole!");
		_catchRevert(err);
		return false;
	}
	return true;
}

/**
 * @dev Adds starving artists for the provided ETH address.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 * @param address The artist's ETH address.
 * @param donor1 The 1st donation address.
 * @param donor2 The 2nd donation address.
 * @param donor3 The 3rd donation address.
 */
async function update(Buttholes, address, donor1, donor2, donor3) {
	console.log("Adding starving artists to contract for address: %s\n-> %s\n-> %s\n-> %s", address, donor1, donor2, donor3);
	async function _update() {
		try {
			const gasLimit = await Buttholes.estimateGas.updateCheekSpreader(address.toString(), donor1.toString(), donor2.toString(), donor3.toString());
			const tx = await Buttholes.updateCheekSpreader(address.toString(), donor1.toString(), donor2.toString(), donor3.toString(), {'gasLimit':gasLimit});
			const receipt = await tx.wait();
			// console.debug(receipt);
			console.log(`Successfully added starving artists!\n-> ${donor1}\n-> ${donor2}\n-> ${donor3}`);
		}
		catch (err) {
			console.warn("Unable to add new starving artists!");
			_catchRevert(err);
			return false;
		}
		return true;
	}
	async function _create() {
		try {
			const gasLimit = await Buttholes.estimateGas.createCheekSpreader(donor1.toString(), donor2.toString(), donor3.toString());
			const tx = await Buttholes.updateCheekSpreader(donor1.toString(), donor2.toString(), donor3.toString(), {'gasLimit':gasLimit});
			const receipt = await tx.wait();
			// console.debug(receipt);
			console.log(`Successfully created starving artists! ${address}\n-> ${donor1}\n-> ${donor2}\n-> ${donor3}`);
		}
		catch (err) {
			console.warn("Unable to create new starving artists!");
			_catchRevert(err);
			return false;
		}
		return true;
	}
	// create if update fails
	if (!await _update()) return await _create();
	return true;
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 */
async function renounce(Buttholes) {
	console.log("Renouncing butthole from contract...");
	try {
		const gasLimit = await Buttholes.estimateGas.renounceButthole();
		const tx = await Buttholes.renounceButthole({'gasLimit':gasLimit});
		const receipt = await tx.wait();
		// console.debug(receipt);
		const event = receipt.events.find(x => x.event === "PuckerDown");
		if (event) {
			// console.debug(event);
			console.log(`Successfully renounced butthole! ${event.args.removedButthole}`);		
		}
		else
			console.warn("Failed to renounce butthole!");
	}
	catch (err) {
		console.warn("Unable to renounce butthole!");
		_catchRevert(err);
		return false;
	}
	return true;
}

module.exports = {
	add,
	confirm,
	getButtholeOwners,
	getButtholeURI,
	isAdmin,
	isMinter,
	update,
	mint,
	renounce
}