#!/bin/bash


# Adds a new butthole NFT.

# Requires:
# 	- Ethereum account
#  	- butthole pic (jpg, jpeg, png, etc)
# 	- [OPTIONAL] 3 alternate donation addresses

# 1) prepare Ethereum account address
# - save in spreadsheet or something similar

# 2) prepare butthole jpeg for long term storage
# - add image to ipfs, get file hash CID

# 3) add new butthole
# - send tx to Buttholes contract via addButthole(newButthole, _tokenURI)
# 	newButthole --> an Ethereum address that represents a person
# 	_tokenURI 	--> the newly generated ipfs CID

# 4) update the starving artists / CheekSpreader
# - send tx to Buttholes contract via updateCheekSpreader(address, donor1, donor2, donor3)




# can add just an artist or an artist w/ up to 3 starving artists
node js/butthole.js --add -a "ARTIST" -i "IMAGE_PATH" -b "BIRTHDAY" -d "DESCRIPTION" -n "NAME"
node js/butthole.js --add -a "ARTIST" -i "IMAGE_PATH" -b "BIRTHDAY" -d "DESCRIPTION" -n "NAME" -a "STARVING_ARTIST"

# can add up to 3 starving artists at once
node js/butthole.js --donors -a "STARVING_ARTIST" -a "STARVING_ARTIST"
node js/butthole.js --donors -a "STARVING_ARTIST" -a "STARVING_ARTIST" -a "STARVING_ARTIST"
node js/butthole.js --donors -a "STARVING_ARTIST" -a "STARVING_ARTIST" -a "STARVING_ARTIST" -a "STARVING_ARTIST"

# renounces the caller's butthole
node js/butthole.js --renounce