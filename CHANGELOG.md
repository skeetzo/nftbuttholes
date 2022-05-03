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

------------------------------------------------------------------------

- test main.js
- test butthole.js
- test contract web interface buttons
- test new cheekspreader interaction w/ royalties
- finish debugging web3.0 interaction in main.js

# TODO

- implement Loopring counterfactual nfts & submitMintNft functionality

- add test for updateCheekSpreader function
- add test for renounceButthole function

- document butthole.js & main.js

- [writeup] steps for minting / uploading / creating an nft
-- accessible method for updating / uploading butthole pics
-- accessible method for minting
-- instructions for how to send me info to add a butthole & how I do so

- write better tests for CheekSpreader even though it totally already works fine (totally, yeah, sure)

- [much later] update contract to use 1 total CheekSpreader.sol for each NFT instead of individual contracts

- add final address of contract on mainnet to etherscan link in readme

# Dev

ganache-cli -m "cloud sting village source peace dinner dance fringe slice mandate lens upon"

yarn add @openzeppelin/contracts
yarn add dotenv web3 truffle-hdwallet-provider
yarn add -D chai chai-almost mocha nodemon truffle-assertions

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

