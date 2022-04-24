// https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721Enumerable

const testnet = "https://ropsten.infura.io/";
const contractAddress = "";

const web3 = new Web3(new Web3.providers.HttpProvider(testnet));
const buttholesContract = new web3.eth.Contract(abi);

let balance = await buttholesContract.balanceOf(account)
let tokens = [];

for (let i=0;i<balance;i++) {
	let token = await buttholesContract.tokenOfOwnerByIndex(i);
	tokens.push(token);
}

if (tokens.length == 0) return console.log("No tokens found!");
console.log("Tokens: "+tokens.join(", "));