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