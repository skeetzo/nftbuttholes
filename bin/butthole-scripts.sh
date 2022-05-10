#!/bin/bash

# Adds a new butthole NFT.

# Requires:
# 	- Ethereum account
#  	- butthole pic (jpg, jpeg, png, etc)
# 	- [OPTIONAL] 3 alternate donation addresses

# 1) prepare Ethereum account address
# - be sure to save in spreadsheet or something similar

# 2) prepares butthole jpeg for long term storage
# - adds image to ipfs and uses file hash CID

# 3) adds new butthole
# - send tx to Buttholes contract via addButthole(newButthole, _tokenURI)
# 	newButthole --> an Ethereum address that represents a person
# 	_tokenURI 	--> the newly generated ipfs CID

# 4) update the starving artists / CheekSpreader
# - send tx to Buttholes contract via updateCheekSpreader(address, donor1, donor2, donor3)

# 5) [optionally] renounce butthole
# - renouncer must be caller
# - send tx to Buttholes contract via renounceButthole

node js/butthole.js help

# can add just an artist or an artist w/ up to 3 starving artists
node js/butthole.js help add
node js/butthole.js add "ARTIST" "IMAGE_PATH" -b "BIRTHDAY" -d "DESCRIPTION" -n "NAME"
node js/butthole.js add "ARTIST" "IMAGE_PATH" -b "BIRTHDAY" -d "DESCRIPTION" -n "NAME" -s "STARVING_ARTIST"

# can add up to 3 starving artists at once
node js/butthole.js help update
node js/butthole.js update "ARTIST" -s "STARVING_ARTIST" -s "STARVING_ARTIST"
node js/butthole.js update -s "STARVING_ARTIST" -s "STARVING_ARTIST" -s "STARVING_ARTIST"
node js/butthole.js update -s "STARVING_ARTIST" -s "STARVING_ARTIST" -s "STARVING_ARTIST" -s "STARVING_ARTIST"

# renounces the caller's butthole
node js/butthole.js --renounce