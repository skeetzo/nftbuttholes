// https://www.npmjs.com/package/ipfs-http-client#createoptions

npm install ipfs-http-client

import { create } from 'ipfs-http-client'

// connect to the default API address http://localhost:5001
const client = create()

// connect to a different API
const client = create('http://127.0.0.1:5002')

// connect using a URL
const client = create(new URL('http://127.0.0.1:5002'))

// call Core API methods
const { cid } = await client.add('Hello world!')








import { create } from 'ipfs-http-client'

// connect to ipfs daemon API server
const ipfs = create('http://localhost:5001') // (the default in Node.js)

// or connect with multiaddr
const ipfs = create('/ip4/127.0.0.1/tcp/5001')

// or using options
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })

// or specifying a specific API path
const ipfs = create({ host: '1.1.1.1', port: '80', apiPath: '/ipfs/api/v0' })