#!/bin/bash

# returns CID hash of file
wget -q -O - http://url.tld | ipfs add -q

ipfs add /file/path

# add to MFS
ipfs files cp /ipfs/<ipfs-CID> /dst/path/

########################################################################

# returns CID hash of file from web
WEB=http://url.tld
HASH=$(wget -q -O - $WEB | ipfs add -q)
ipfs files cp /ipfs/$HASH /buttholes

# add to MFS
HASH=$(ipfs add /file/path/butthole.jpg)
ipfs files cp /ipfs/$HASH /buttholes