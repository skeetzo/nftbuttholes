// adds a new butthole account
// requires:
// 	- Ethereum account
// #	- butthole pic (jpg, jpeg, png, etc)
// 	- [OPTIONAL] 3 alternate donation addresses

// 1) prepare Ethereum account address
// - save in spreadsheet or something similar

// 2) prepare butthole jpeg for long term storage
// - add image to ipfs, get file hash CID

// 3) add new butthole
// - send tx to Buttholes contract via addButthole(newButthole, _tokenURI)
// 	newButthole --> an Ethereum address that represents a person
// 	_tokenURI 	--> the newly generated ipfs CID

// 4) update the donors / CheekSpreader
// - send tx to Buttholes contract via createCheekSpreader(donor1, donor2, donor3)
// - retrieve donor1, 2, & 3 from .env