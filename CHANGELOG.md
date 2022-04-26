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

------------------------------------------------------------------------


# TODO

- write better tests for PaymentSplitPusher even though it totally already works fine

- [writeup] steps for minting / uploading / creating an nft
- create single page w/ 18+ button for viewing to ensure actual image is age gated
-- add 18+ confirm button for granting minter role
-- accessible method for updating / uploading butthole pics
-- accessible method for minting

# Dev

yarn add @openzeppelin/contracts
yarn add dotenv web3 truffle-hdwallet-provider
yarn add -D chai chai-almost mocha nodemon truffle-assertions

ganache-cli -m "cloud sting village source peace dinner dance fringe slice mandate lens upon"

# Links

https://docs.openzeppelin.com/contracts/4.x/api/token/erc721
https://www.linkedin.com/pulse/nfts-keys-web3-authentication-pseudonymous-economy-misch-strotz
https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum

http://docs.ipfs.io.ipns.localhost:8080/how-to/mint-nfts-with-ipfs/#minty
https://github.com/yusefnapora/minty

# Addresses

Ukraine Government:
0x165CD37b4C644C2921454429E7F9358d18A45e14

https://www.actionagainsthunger.org/story/donate-crypto
Action Against Hunger USA
0xC7c3A15b7e5C1f121fE09064f6eCe9aBF87Bbd8c

https://internationalmedicalcorps.org/get-involved/other-ways-to-give/donatebitcoin/
International Medical Corps
0x5F08845e53Ba171B7a782D0CdEA96Ab720426260