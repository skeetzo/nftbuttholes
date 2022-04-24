// https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum
var ethers = require('ethers');
var url = 'ADD_YOUR_ETHEREUM_NODE_URL';
var provider = new ethers.providers.JsonRpcProvider(url);
var address  = 'CONTRACT_ADDRESS_FROM_REMIX';
var abi = [];
var contract = new ethers.Contract(address, abi, provider);

contract.getHash().then((result) =>{
  document.getElementById("btn").onclick = function () {
		location.href = "https://ipfs.io/ipfs/"+result;
  	};
});