
const DEFAULT_URI = "ipfs://";

var Buttholes;
var web3Provider;
var signer;
var account;

////////////////////////////////////////////////////////////////////////////////////

// Web3.0 //

// - can connect to web3 provider

// Contract //

// - can get account
// - can interact with smart contract

async function connectToContract() {
  function _default() {
      try {
          web3Provider = new ethers.getDefaultProvider(window.ethereum);
      }
      catch (err) {
          console.error(err.message);
      }
  }
  function _web3() {
      try {
          web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      }
      catch (err) {
          alert("Be sure to unlock your wallet!");
          console.error(err.message);
      }
  }
  function _static() {
      try {
          web3Provider = new ethers.providers.StaticJsonRpcProvider(window.ethereum);
      }
      catch (err) {
          alert("Be sure to unlock your wallet!");
          console.error(err.message);
      }
  }
  _default();
  if (!web3Provider) _web3();
  if (!web3Provider) _static();
  if (!web3Provider) return console.error("Unable to connect to provider!");
  // await web3Provider.send("eth_requestAccounts", []);
  signer = web3Provider.getSigner();
  account = await signer.getAddress();
  console.debug("address: "+account);
  //
  Buttholes = new ethers.Contract("#{address}", !{abi}, signer);
  const ButtholesInterface = require('../build/contracts/Buttholes.json');
	const abi = ButtholesInterface.abi;
	// load network to find contract address
	const { chainId } = await web3Provider.getNetwork();
	console.log("Chain ID: %s",chainId); // 42
	const address = ButtholesInterface.networks[chainId].address;
	console.log("Contract Address: %s", address);
	Buttholes = new ethers.Contract(address, abi, signer);

  web3Provider.on("network", (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        if (oldNetwork != 0)
          alert("Please connect your wallet to the Ethereum network!");
        window.location.reload();
      }
  });
}

////////////////////////////////////////////////////////////////////////////////////

// - can get owned buttholes
// - can show / hide buttholes

// get all tokens owned by connected wallet
async function getButtholes() {
	let balance = await Buttholes.balanceOf(account)
	let tokens = [];
	for (let i=0;i<balance;i++) {
		let token = await Buttholes.tokenOfOwnerByIndex(i);
		tokens.push(token);
	}
	if (tokens.length == 0) return console.log("No tokens found!");
	console.log("Tokens: "+tokens.join(", "));
	return tokens;
}

let divs = [];
function showButthole(tokenId, tokenURI) {
	console.log("Showing butthole: %s - %s", tokenId, tokenURI);
	// butthole
	var iDiv = document.createElement('img');
	iDiv.id = tokenId;
	iDiv.className = 'butthole';
	iDiv.src = tokenURI;
	document.getElementsByTagName('body')[0].appendChild(iDiv);
	// buttflap
	var innerDiv = document.createElement('img');
	innerDiv.className = 'flap'
	iDiv.src = DEFAULT_URI;
	iDiv.appendChild(innerDiv);
	divs.push(iDiv);
}

////////////////////////////////////////////////////////////////////////////////////

// Contract Interface //

// - can confirm age
// - can mint
// - can view

//- 18+ confirm
document.getElementById("eighteen").onclick = async function () {
	try {
		await connectToContract();
		await getContract();
		if (!await Buttholes.hasRole(await Buttholes.MINTER_ROLE(), account)) {	
			const tx = await Buttholes.addMinter({'from':account});
			const receipt = await tx.wait();
			console.log(receipt.logs);
			const event = receipt.events.find(x => x.event === "RoleGranted");
			console.log(event);
			console.log(event.args.account); // account
			//
			console.log("successfully added minting!");		    
			document.getElementById("mint").enable();
		}
		if (await Buttholes.hasRole(await Buttholes.DEFAULT_ADMIN_ROLE(), account)) {	
			document.getElementById("add").show();
			document.getElementById("add").enable();
		}
		document.getElementById("mint").show();
		document.getElementById("view").show();
		document.getElementById("eighteen").hide();
		console.log("successfully accepted consequences!");
	}
	catch (err) {
		console.error(err);
	}
};

//- mint butthole after minter role has been added
document.getElementById("mint").onclick = async function () {
	const tx = await Buttholes.mint(account);
	const receipt = await tx.wait();
	console.log(receipt.logs);
	const event = receipt.events.find(x => x.event === "Transfer");
	if (event) {
		console.log(event);
		console.log(event.args.account); // account
		console.log(event.args.tokenId.toString());
	}
};

//- view butthole images in wallet
document.getElementById("view").onclick = async function () {
	for (div of divs)
		div.remove();
	let tokens = getButtholes();
	for (tokenId of tokens)
		showButthole(tokenId, await Buttholes.tokenURI(tokenId));
};

////////////////////////////////////////////////////////////////////////////////////

//- Connects Ethereum account from enabled Wallet
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
