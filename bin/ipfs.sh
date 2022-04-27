#!/bin/bash

# returns CID hash of file
wget -q -O - http://url.tld | ipfs add -q

ipfs add /file/path

# add to MFS
ipfs files cp /ipfs/<ipfs-CID> /dst/path/