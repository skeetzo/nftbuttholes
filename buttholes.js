// https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum

var ethers = require('ethers');
var url = "127.0.0.1";
var provider = new ethers.providers.JsonRpcProvider(url);

// TODO
// load abi and address from a file
var address  = process.env.BUTTHOLE_ADDRESS || "";
var abi = [];

var contract = new ethers.Contract(address, abi, provider);


// 18+ confirm
//- allow user to click other buttons

// mint butthole
//- pay for / add butthole to wallet
let tokenId = 0;

// view buttholes
//- get each token owned by wallet
// function to display all tokens on an html page

contract.tokenURI(tokenId).then((result) =>{
  document.getElementById("mint").onclick = function () {
		location.href = "https://ipfs.io/ipfs/"+result;
  };
});
