
var ethers = require('ethers');
var url = "127.0.0.1";
var provider = new ethers.providers.JsonRpcProvider(url);

////////////////////////////////////////////////////////////////////////////////////

// TODO
// load abi and address from a file
var address  = process.env.BUTTHOLE_ADDRESS || "";
var abi = [];

var contract = new ethers.Contract(address, abi, provider);

////////////////////////////////////////////////////////////////////////////////////

// TODO
// 18+ confirm
//- allow user to click other buttons

// TODO
// mint butthole
//- pay for / add butthole to wallet
// let tokenId = 0;

// TODO
// view uncensored butthole images
//- get each token owned by wallet
//- add function to display all tokens on an html page

//- adjust below to be useful for viewing
// contract.tokenURI(tokenId).then((result) =>{
//   document.getElementById("mint").onclick = function () {
// 		location.href = "https://ipfs.io/ipfs/"+result;
//   };
// });