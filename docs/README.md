# Javascript

**buttholes.js**

### Purpose
Single script to be ran that accepts: ETH address for new butthole account + path to local butthole jpeg + any additional metadata 
-> uploads image and metadata to IPFS
-> anyone can then mint the newly available butthole

#### Steps for creating an NFT w/ matching metadata.json uploaded to IPFS
- have available: 1 Ethereum address & 1 butthole jpeg/png
- run '--add -a $ETH_ADDRESS -i path/to/image ...'
- check if artist's butthole exists already; if so, increase edition # by 1
- upload butthole image to IPFS
- create a new default metadata.json
- update default template with new artist data & butthole image CID
- upload the newly configured metadata.json file to IPFS
- call the contract to add a new butthole with artist address + the uploaded metadata.json CID
--
- run '--donors -a $ETH_ADDRESS -a $DONATION1 -a $DONATION2 -a $DONATION3'
- call the contract to update the forwarded donations for the provided artist address

#### Steps for Progressing Mint "phases"
- increase Edition by 1 --> automatically when uploading a 2nd (or more) NFT of a same artist name

Run `node buttholes.js help` for more info.

---

### VIP Benefits
#### Instructions:
[add instructions for implementing js code]

#### Participating Sites:
**Mine**:
[none yet]
**Others**:
[none yet]
