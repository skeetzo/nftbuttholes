// Access Functions for Smart Contract
// -> add, mint, update, renounce

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
		console.debug(receipt);
		const event = receipt.events.find(x => x.event === "PuckerUp");
		if (event) {
			console.debug(event);
			console.log(`Successfully added butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		else
			console.warn("Failed to add new butthole!");
	}
	catch (err) {
		console.error(err);
		console.warn("Unable to add new butthole!");
		console.error(JSON.parse(err.body).error.data.reason);
	}
}

/**
 * @dev Adds a user to minting role aka 18+ access.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 */
async function addMinter(Buttholes) {
	try {
		const gasLimit = await Buttholes.estimateGas.addMinter();
		const tx = await Buttholes.addMinter({'gasLimit':gasLimit});
		const receipt = await tx.wait();
		console.log(receipt.logs);
		const event = receipt.events.find(x => x.event === "RoleGranted");
		console.log(event);
		console.log(event.args.account); // account
		console.log("successfully added minting!");		    
	}
	catch (err) {console.error(err);}
};

/**
 * @dev Check if address has admin role.
 * @param address The address to check.
 */
async function isAdmin(Buttholes, address) {
	return await Buttholes.hasRole(await Buttholes.DEFAULT_ADMIN_ROLE(), address);
}

/**
 * @dev Check if address has minter role.
 * @param address The address to check.
 */
async function isMinter(Buttholes, address) {
	return await Buttholes.hasRole(await Buttholes.MINTER_ROLE(), address);
}

/**
 * @dev Mints a butthole NFT.
 * @param to The address to receive the token.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 */
async function mint(Buttholes, to) {
	console.log("Minting butthole to address: %s", to);
	try {
		const gasLimit = await Buttholes.estimateGas.mint(to.toString());
		const tx = await Buttholes.mint(to.toString(), {'gasLimit':gasLimit});
		const receipt = await tx.wait();
		console.debug(receipt);
		const event = receipt.events.find(x => x.event === "Transfer");
		if (event) {
			console.debug(event);
			console.log(`Successfully minted butthole: ${event.args.addedButthole} - ${event.args.buttholeHash}`);
		}
		else
			console.warn("Failed to mint butthole!");
	}
	catch (err) {
		console.error(err);
		console.warn("Unable to mint butthole!");
		console.error(JSON.parse(err.body).error.data.reason);
	}
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
			console.debug(receipt);
			console.log("Successfully added starving artists!");
		}
		catch (err) {
			console.error(err);
			console.warn("Unable to add new starving artists!");
			console.error(JSON.parse(err.body).error.data.reason);
			return false;
		}
		return true;
	}
	async function _create() {
		try {
			const gasLimit = await Buttholes.estimateGas.createCheekSpreader(donor1.toString(), donor2.toString(), donor3.toString());
			const tx = await Buttholes.updateCheekSpreader(donor1.toString(), donor2.toString(), donor3.toString(), {'gasLimit':gasLimit});
			const receipt = await tx.wait();
			console.debug(receipt);
			console.log("Successfully created starving artists!");
		}
		catch (err) {
			console.error(err);
			console.warn("Unable to create new starving artists!");
			console.error(JSON.parse(err.body).error.data.reason);
		}
	}
	// create if update fails
	if (!await _update()) await _create();
}

/**
 * @dev Renounce your Butthole NFT. Must be called by the rouncing artist.
 * @param Buttholes The Buttholes contract object provided by Ethers.
 */
async function renounce(Buttholes) {
	console.log("Renouncing butthole from contract...");
	const gasLimit = await Buttholes.estimateGas.renounceButthole();
	const tx = await Buttholes.renounceButthole({'gasLimit':gasLimit});
	try {
		const receipt = await tx.wait();
		console.debug(receipt);
		const event = receipt.events.find(x => x.event === "PuckerDown");
		if (event) {
			console.debug(event);
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

module.exports = {
	add,
	addMinter,
	isAdmin,
	isMinter,
	update,
	mint,
	renounce
}