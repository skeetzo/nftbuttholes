
const ButtholesInterface = require("./butthole.js");
const $ = require('jquery')

const DEFAULT_URI = "ipfs://";
var divs = [];
var account;

////////////////////////////////////////////////////////////////////////////////////

// Contract Interface //

/**
 * @dev Add a butthole. Must be owner.
 */
document.getElementById("add").onclick = async function () {
	const butthole = {
		artist : prompt("Artist's ETH address"),
		image : prompt("Path to image"),
		name : prompt("Artist's name"),
		description : prompt("Artist's description"),
		birthday : prompt("Artist's birthday"),
		starvingArtists : [prompt("1st starving artist"), prompt("2nd starving artist"), prompt("3rd starving artist")]
	};
	await ButtholesInterface.add(butthole);
}

/**
 * @dev Connects to Web3.0 wallet.
 */
document.getElementById("connect").onclick = async function () {
	try {
		let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		account = accounts[0];
        document.getElementById("account").innerHTML = account;
		if (await ButtholesInterface.isAdmin(account)) {	
			$("#add").show();
			document.getElementById("add").removeAttribute("disabled");
		}
		console.log("successfully connected wallet!");
		$("#eighteen").show();
		$("#connect").hide();
	}
	catch (err) {
		console.warn("failed to connect wallet!");
		console.error(err);
		alert("Be sure to unlock your wallet!");
	}
}

/**
 * @dev Confirm 18+ and add minter role.
 */
document.getElementById("eighteen").onclick = async function () {
	if (await ButtholesInterface.isAdmin(account)) {	
		$("#add").show();
		document.getElementById("add").removeAttribute("disabled");
	}
	if (!await ButtholesInterface.isMinter(account))
		await ButtholesInterface.addMinter();
	$("#mint").show();
	document.getElementById("mint").removeAttribute("disabled");
	$("view").show();
	$("#eighteen").hide();
	console.log("successfully accepted consequences!");
};

/**
 * @dev Mint butthole. Requires minter role.
 */
document.getElementById("mint").onclick = async function () {
	await ButtholesInterface.mint(account);
};

/**
 * @dev Updates starving artists.
 */
document.getElementById("update").onclick = async function () {
	let artist1 = prompt("1st starving artist");
	let artist2 = prompt("2nd starving artist");
	let artist3 = prompt("3rd starving artist");
	//
	const butthole = {
		'artist' : account.toString(),
		'starvingArtists' : [artist1, artist2, artist3]
	};
	await ButtholesInterface.update(butthole);
};

/**
 * @dev View butthole NFT images in connected wallet.
 */
document.getElementById("view").onclick = async function () {
	for (div of divs)
		div.remove();
	let _buttholes = getButtholes();
	for (butthole of _buttholes)
		showButthole(butthole);
};

////////////////////////////////////////////////////////////////////////////////////

// IPFS //

/**
 * @dev Get all butthole tokens owned by connected wallet.
 */
async function getButtholes() {
	let balance = await Buttholes.balanceOf(account)
	let _buttholes = [];
	for (let i=0;i<balance;i++) {
		let butthole = await Buttholes.tokenOfOwnerByIndex(i);
		butthole = await Buttholes.tokenURI(butthole);
		butthole = await getButtholeFromIPFS(butthole);
		_buttholes.push(butthole);
	}
	if (_buttholes.length == 0) return console.log("No buttholes found!");
	console.log("Buttholes: "+_buttholes.join(", "));
	return _buttholes;
}

/**
 * @dev Show the image for the provided butthole NFT.
 * @param butthole The butthole NFT metadata.
 */
function showButthole(butthole) {
	console.log(`Showing butthole: ${butthole.tokenId} - ${butthole.properties.name.value}`);
	var iDiv = document.createElement('img');
	iDiv.id = butthole.tokenId;
	iDiv.className = 'butthole';
	iDiv.src= "data:image/png;base64," + getButtholeImageFromIPFS(butthole.properties.butthole.value);
	document.getElementsByTagName('body')[0].appendChild(iDiv);
	// buttflap
	var innerDiv = document.createElement('img');
	innerDiv.className = 'flap'
	iDiv.src = !isNaN(butthole.properties.image.value) ? butthole.properties.image.value : DEFAULT_URI;
	iDiv.appendChild(innerDiv);
	divs.push(iDiv);
}

////////////////////////////////////////////////////////////////////////////////////

//- checks for Metamask
$(document).ready(() => {
	if (typeof window.ethereum !== 'undefined') {
		console.log('MetaMask is installed!');
		ethereum.on('chainChanged', (chainId) => {
		  console.debug("chainId: %s", chainId);
		  if (chainId != 0) alert("Please connect your wallet to the Ethereum network!");
		});
	}
	else
		console.error("Please install MetaMask!");
});
