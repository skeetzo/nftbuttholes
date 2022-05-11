# Changelog

**0.0.0 : 4/22/2022**
	- setup
	- "majority" of contract
	- tests setup
	**0.0.1 : 4/23/2022**
	- added PaymentSplitPusher
	- added default uri for public "viewing"
	- PaymentSplitPusher skele
	- tests for PaymentSplitPusher
	- added VIP membership "utility"
	-- [utility] write javascript code that can be used to check balance for NFT ownership
	**0.0.2 : 4/24/2022**
	- added "starving artists" address fund / finished PaymentSplitPusher
	-- created modified paymentsplitter that pushes instead of waits for pulls
	- compiled contracts
	- added PaymentSplitPusher to Butthole's royalties process
	**0.0.3 : 4/25/2022**
	- test minting
	- test "butthole" uri uploads
	- Butthole.sol tests complete
	- tested PaymentSplitPusher
	- began writeup for NFT steps
	**0.0.4 : 4/26/2022**
	- updated PaymentSplitPusher interaction to ensure royalties are split to butthole artists before / with donors
	- added fix for paymentsplitter royalties
	- added main.js for bundling
	- renamed PaymentSplitPusher to CheekSpreader... cause duh
	- created single page w/ 18+ button for viewing to ensure actual images are age gated; requires confirming via adding minter role
	- continued write up for project "explainer"
	**0.0.5 : 4/27/2022**
	- finished tests for Buttholes.sol (again)
	**0.0.6 : 5/1/2022**
	- more debugging main.js & butthole.js
	- figured out how metadata.json fits
	**0.0.7 : 5/2/2022**
	- finished `butthole.js` script in js/
	- decided on method for inputting new butthole data to butthole.js args -> {} in a file? runtime args? ----> solution: runtime args
	- finished ipfs metadata functions
	- added extra CheekSpreader function that can be accessed only once by owner of contract for updating new buttholes -> updateCheekSpreader
	- full(ish) implementation of ipfs & html
	**0.0.8 : 5/3/2022**
	- add test for updateCheekSpreader function
	- add test for renounceButthole function
	- test butthole.js
	- documented butthole.js
	**0.0.9 : 5/4/2022**
	- finished testing butthole.js contract interactions
	- continued debugging butthole.js ipfs stuff
	- added ipfs directory setups / checks
	- data writes to ipfs successfully -> requires updating the naming scheme to prevent overwriting issues
	**0.0.10 : 5/9/2022**
	- updated butthole.js w/ command line help menu; restructured args & options
	- [writeup] steps for minting / uploading / creating an nft
	-- accessible method for updating / uploading butthole pics
	-- accessible method for minting
	-- instructions for how to send me info to add a butthole & how I do so
	**0.0.11 : 5/10/2022**
	- documented main.js
	- finished debugging web3.0 interactions in main.js; connects to web3.0 & contract
	- tested main.js
	- tested contract web interface buttons
	- updates to index.html
	**0.0.12 : 5/11/2022**
	- restructured js scripts
	- added 'process' file shim @ project root for browserify

------------------------------------------------------------------------

	- finish testing main.js
	- finish testing contract web interface buttons
	- finish IPFS interaction in butthole.js that requires updated naming scheme

# TODO

- add ETH cost to minting

- restructure naming scheme and folder layout: artistName/images, artistName/editions
-- so basically change metadata to edition #?
-- and organize within artistName folders to allow multiple same named files in places

- actually test new cheekspreader interaction w/ royalties
- write better tests for CheekSpreader even though it totally already works fine (totally, yeah, sure)

- add test file for js/butthole.js
-- add tests for birthday date string
- add test file for js/main.js

- implement Loopring counterfactual nfts & submitMintNft functionality
- add tests for Loopring interactions

- update instructions for performers / butthole artists 
- [later] update contract to use 1 total CheekSpreader.sol for each NFT instead of individual contracts
- [after release] add final address of contract on mainnet to etherscan links in docs

# Dev

requires node @ 16.0.0

http-server

ganache-cli -m "cloud sting village source peace dinner dance fringe slice mandate lens upon" -i 1337

Available Accounts
==================
(0) 0xbC6bC940487C13208FDD7f02d5eF9d9FC886700f (1000 ETH)
(1) 0xA17A41B08a536b004C3Ff379298bAeadE98171B3 (1000 ETH)
(2) 0xc9Ff2b62CF14941d96bAAFecFEBae1a83fd82a7F (1000 ETH)
(3) 0x3Ac74B86550a493EA3F1D8Da7685AeD17CD7a524 (1000 ETH)
(4) 0x1ebC00C33F89162a042f44D201B94014B283d3a6 (1000 ETH)
(5) 0xB0aEdB12bD892A0A14EC385879c143a75B2833E7 (1000 ETH)
(6) 0xbBF637F4425366211fDF60049458A2f33dE9EDDe (1000 ETH)
(7) 0x629fA1d7991783576EEAb84392c8e88E5318C1b0 (1000 ETH)
(8) 0x57A971063c06a15A90eFeb2aFb190d257c124820 (1000 ETH)
(9) 0xa70A86F03efc40Dbc926AE92eABAcDE6ff3920B8 (1000 ETH)

Private Keys
==================
(0) 0x0a9a050b15dcb2302918c2f19dbf7af04c063763f24d16c01967bf17c660fc7e
(1) 0x601ad8fdc86b4abba00a7e5bbb733db5d202f9dd0ebb95b766db331d3af4680b
(2) 0x95adf4efb60f293c8ca613fa21bdfc9d0c29342e7b878927a9ced4f9ba58e1ec
(3) 0x7bac0f2b81c428812b2661bf54f0b9a2fdfb8bc8f117bbdd506b0a0006511422
(4) 0xc9322587c4bc46193a7ea549a60179d95ddfbf1fd07540f5a74b4eca3f1db3e8
(5) 0x715a6bf2f0f63c33a043e6479a4160ca473ce0dd2b151a8e4b5423b9f950461d
(6) 0x21ccf10ca1e234f8a0d8b40aa66e6975c26d33c96811e81e02bb94abc6a39c43
(7) 0x9e14463bf918b4cdd42539d89fdd5ee1e690ea48fe4d307932b7080591322ff3
(8) 0xe5018a7b66fe459ccc10908e0e6452518d1b0ace0ed06e98228359a8f0c5d03c
(9) 0x32ce92be4745c2d91ebe6107cb5a4b7dd392c30e4e169d86a62ae5a4d378a650

yarn add @openzeppelin/contracts
yarn add dotenv web3 truffle-hdwallet-provider
yarn add -D chai chai-almost mocha truffle-assertions ipfs-http-client

Image notes:
- Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.
- 350x350
- animation_url: A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.

# Links

https://docs.openzeppelin.com/contracts/4.x/api/token/erc721
https://www.linkedin.com/pulse/nfts-keys-web3-authentication-pseudonymous-economy-misch-strotz
https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum

http://docs.ipfs.io.ipns.localhost:8080/how-to/mint-nfts-with-ipfs/#minty
https://github.com/yusefnapora/minty

https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples
https://www.npmjs.com/package/ipfs-http-client#createoptions
https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfscatipfspath-options

https://medium.loopring.io/loopring-now-supports-nfts-on-l2-29174a343d0d
https://docs.loopring.io/en/integrations/counter_factual_nft.html
https://docs.loopring.io/en/dex_apis/submitMintNft.html

gas / fee estimates
https://github.com/ethers-io/ethers.js/discussions/2439


https://www.npmjs.com/package/http-server


# Addresses

Ukraine Government:
0x165CD37b4C644C2921454429E7F9358d18A45e14

https://www.actionagainsthunger.org/story/donate-crypto
Action Against Hunger USA
0xC7c3A15b7e5C1f121fE09064f6eCe9aBF87Bbd8c

https://internationalmedicalcorps.org/get-involved/other-ways-to-give/donatebitcoin/
International Medical Corps
0x5F08845e53Ba171B7a782D0CdEA96Ab720426260

# Scraps

browserify js/main.js -o js/bundle.js

Date Traits
OpenSea also supports a date display_type. Traits of this type will appear in the right column near "Rankings" and "Stats." Pass in a unix timestamp (seconds) as the value.

    {
      "display_type": "date", 
      "trait_type": "birthday", 
      "value": 1546360800
    }


curl -X POST --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}' localhost:8545




// if they have an IPFS enabled browser, return
// <!-- <img src="https://ipfs.infura.io:5001/api/v0/cat/QmQuTjzy8aZyYqYRyH7UdE5qcDXTxLFYEE9GKNhPY6D6K1"> -->

// if they do not have an IPFS enabled browser, fetch the image resource for them
