// https://js.ipfs.io/


// Adding data to IPFS


const node = await IPFS.create()

const data = 'Hello, <YOUR NAME HERE>'

// add your data to to IPFS - this can be a string, a Buffer,
// a stream of Buffers, etc
const results = node.add(data)

// we loop over the results because 'add' supports multiple 
// additions, but we only added one entry here so we only see
// one log line in the output
for await (const { cid } of results) {
  // CID (Content IDentifier) uniquely addresses the data
  // and can be used to get it again.
  console.log(cid.toString())
}


// Getting data from IPFS

const node = await IPFS.create()

const stream = node.cat('QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A')
let data = ''

for await (const chunk of stream) {
  // chunks of data are returned as a Buffer, convert it back to a string
  data += chunk.toString()
}

console.log(data)






// Using the CLI

// npm install ipfs -g
// jsipfs cat QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A

// Using the HTTP Gateway

// https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A












// http://docs.ipfs.io.ipns.localhost:8080/how-to/mint-nfts-with-ipfs/#how-minty-works

async mintToken(ownerAddress, metadataURI) {
  // The smart contract adds an ipfs:// prefix to all URIs, 
  // so make sure to remove it so it doesn't get added twice
  metadataURI = stripIpfsUriPrefix(metadataURI)

  // Call the mintToken smart contract function to issue a new token
  // to the given address. This returns a transaction object, but the 
  // transaction hasn't been confirmed yet, so it doesn't have our token id.
  const tx = await this.contract.mintToken(ownerAddress, metadataURI)

  // The OpenZeppelin base ERC721 contract emits a Transfer event 
  // when a token is issued. tx.wait() will wait until a block containing 
  // our transaction has been mined and confirmed. The transaction receipt 
  // contains events emitted while processing the transaction.
  const receipt = await tx.wait()
  for (const event of receipt.events) {
    if (event.event !== 'Transfer') {
        console.log('ignoring unknown event type ', event.event)
        continue
    }
    return event.args.tokenId.toString()
  }

  throw new Error('unable to get token id')
}



async createNFTFromAssetData(content, options) {
  // add the asset to IPFS
  const filePath = options.path || 'asset.bin'
  const basename =  path.basename(filePath)

  // When you add an object to IPFS with a directory prefix in its path,
  // IPFS will create a directory structure for you. This is nice, because
  // it gives us URIs with descriptive filenames in them e.g.
  // 'ipfs://bafybeihhii26gwp4w7b7w7d57nuuqeexau4pnnhrmckikaukjuei2dl3fq/cat-pic.png' vs
  // 'ipfs://bafybeihhii26gwp4w7b7w7d57nuuqeexau4pnnhrmckikaukjuei2dl3fq'
  const ipfsPath = '/nft/' + basename
  const { cid: assetCid } = await this.ipfs.add({ path: ipfsPath, content })

  // make the NFT metadata JSON
  const assetURI = ensureIpfsUriPrefix(assetCid) + '/' + basename
  const metadata = await this.makeNFTMetadata(assetURI, options)

  // add the metadata to IPFS
  const { cid: metadataCid } = await this.ipfs.add({ 
    path: '/nft/metadata.json', 
    content: JSON.stringify(metadata)
  })
  const metadataURI = ensureIpfsUriPrefix(metadataCid) + '/metadata.json'

  // get the address of the token owner from options, 
  // or use the default signing address if no owner is given
  let ownerAddress = options.owner
  if (!ownerAddress) {
    ownerAddress = await this.defaultOwnerAddress()
  }

  // mint a new token referencing the metadata URI
  const tokenId = await this.mintToken(ownerAddress, metadataURI)

  // format and return the results
  return {
    tokenId,
    metadata,
    assetURI,
    metadataURI,
    assetGatewayURL: makeGatewayURL(assetURI),
    metadataGatewayURL: makeGatewayURL(metadataURI),
  }
}






async getNFTMetadata(tokenId) {
  const metadataURI = await this.contract.tokenURI(tokenId)
  const metadata = await this.getIPFSJSON(metadataURI)

  return {metadata, metadataURI}
}



/**
 * Get the contents of the IPFS object identified by the given CID or URI, and parse it as JSON, returning the parsed object.
 *  
 * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
 * @returns {Promise<string>} - contents of the IPFS object, as a javascript object (or array, etc depending on what was stored). Fails if the content isn't valid JSON.
 */
async getIPFSJSON(cidOrURI) {
    const str = await this.getIPFSString(cidOrURI)
    return JSON.parse(str)
}

/**
 * Get the contents of the IPFS object identified by the given CID or URI, and return it as a string.
 * 
 * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
 * @returns {Promise<string>} - the contents of the IPFS object as a string
 */
async getIPFSString(cidOrURI) {
    const bytes = await this.getIPFS(cidOrURI)
    return uint8ArrayToString(bytes)
}

/**
 * Get the full contents of the IPFS object identified by the given CID or URI.
 * 
 * @param {string} cidOrURI - IPFS CID string or `ipfs://<cid>` style URI
 * @returns {Promise<Uint8Array>} - contents of the IPFS object
 */
async getIPFS(cidOrURI) {
    const cid = stripIpfsUriPrefix(cidOrURI)
    return uint8ArrayConcat(await all(this.ipfs.cat(cid)))
}