// https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum

var ethers = require('ethers');
var url = process.env.ETHEREUM_NODE || "127.0.0.1";
var provider = new ethers.providers.JsonRpcProvider(url);
var address  = process.env.BUTTHOLE_ADDRESS || "";

// TODO
// load abi from a file
var abi = [];

var contract = new ethers.Contract(address, abi, provider);

contract.getHash().then((result) =>{
  document.getElementById("btn").onclick = function () {
		location.href = process.env.IPFS_URL+result;
  };
});

// function to display all tokens on an html page