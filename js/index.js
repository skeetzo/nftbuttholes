const commander = require('commander'),
	  Command = commander.Command;

const { add, confirm, mint, update, renounce } = require('./butthole.js');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @dev Add an artist, confirm, mint, update starving artists, or renounce a butthole NFT.
 */
async function main() {

	const program = new Command();

	program
	  .name('Minty Buttholes')
	  .description('CLI to some JavaScript NFT utilities')
	  .version('0.0.13');

	program.command('add')
	  .description('Add a butthole. Caller must be contract owner.')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .argument('<image>', 'The local path to the butthole image')
	  .option('-n, --name <string>', 'The artist\'s name')
	  .option('-d, --description <string>', 'The artist\'s description')
	  .option('-b, --birthday <date>', 'The artist\'s birthday (MM/DD/YYYY)', parseDate)
	  .option('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole add 0x00.. /path/to/image.jpg -n "My Name" -d "A description." -b "06/06/1990 -s 0x01.. 0x02.. 0x03..`)

	  .action(addNFT)	  
	  .action(async (artist, image, options) => {
	  	await add({
	  		'artist': artist,
		  	'image': image,
		  	'name': options.name,
		  	'description': options.description,
		  	'birthday': options.birthday,
		  	'starvingArtists': options.starve	
	  	});


	  });

	program.command('confirm')
	  .description('Add caller as a minter to confirm 18+ age requirement.')
	  .action(confirm);

	program.command('mint')
	  .description('Mint a butthole.')
	  .option('-a, --address <address>', 'An optional receiving address. Defaults to caller', parseAddress)
	  .option('-b, --butthole <id>', 'Specify the butthole to mint by id', parseId)
	  .option('-r, --random', 'Mint a random butthole (default)')
	  .addHelpText('after', `
Example call:
 $ butthole mint -a 0x00.. -r`)
	  .action(async (options) => {
	  	let {address, butthole} = options;
	  	if (options.random) butthole = -1;
	  	await mint(address, butthole);
	  });

	program.command('update')
	  .description('Update your starving artist(s).')
	  .option('-a, --address <address>', 'The address of the artist to update. Defaults to caller', parseAddress)
	  .requiredOption('-s, --starve [addresses...]', 'Up to 3 \"starving artist\" ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole update -a 0x00.. -s 0x01.. 0x02.. 0x03..`)
	  .action(async (artist, options) => {
	  	await update({
	  		'artist': artist,
			'starvingArtists': options.starve
	  	});
	  });

	program.command('renounce')
	  .description('Renounce your butthole. You can only renounce your own butthole.')
	  .action(renounce);

	return program;
}
module.exports = main;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ---- command action functions



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helpers //

// ensure value is an 0x address
function parseAddress(value) {
	if (!ethers.utils.isAddress(value))
	    throw new commander.InvalidArgumentError('Not an ETH address.');
	return value;
}

// ensure value is a date value that equates to a unix timestamp
function parseDate(value) {
	if (!isValidDate(value))
	    throw new commander.InvalidArgumentError('Not a date.');
	return value;
}

// https://stackoverflow.com/questions/6177975/how-to-validate-date-with-format-mm-dd-yyyy-in-javascript
function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Metadata //

// return skeleton {} metadata
/**
 * @dev Loads and returns the default butthole metadata template.
 */
function _getDefaultMetadata() {
	const nft = require('./metadata.json', 'utf8');
	nft.animation_url = process.env.DEFAULT_ANIMATION_URI
	const date = new Date();
	const timestampInMs = date.getTime();
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	nft.attributes.birthday = unixTimestamp;
	// Properties //
	// image
	nft.properties.image.value = process.env.DEFAULT_PLACEHOLDER_URI
	// butthole
	nft.properties.butthole.value = process.env.DEFAULT_PLACEHOLDER_URI
	nft.properties.edition.value = 1;
	return nft;
}

/**
 * @dev Create's a butthole NFT's metadata from the provided butthole data.
 * @param butthole An object containing nft metadata.
 */
function createButtholeMetadata(butthole) {
	// load default metadata.json and update default values
	const nft = _getDefaultMetadata();
	// update birthday
	// https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
	function _getAge(dateString) {
	    var today = new Date();
	    var birthDate = new Date(dateString);
	    var age = today.getFullYear() - birthDate.getFullYear();
	    var m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}
	const date = new Date(butthole.birthday);
	const unixTimestamp = Math.floor(date.getTime() / 1000);
	const age = _getAge(butthole.birthday);
	console.log(`Birthday: (${age}) ${butthole.birthday} --> ${unixTimestamp}`);
	// update attributes
	nft.attributes.map(a => {if (a["trait_type"] == "birthday") a["value"] = unixTimestamp });
	nft.attributes.map(a => {if (a["trait_type"] == "level") a["value"] = age });
	// update properties
	nft.properties.artist.value = butthole.artist;
	nft.properties.name.value = butthole.name;
	nft.properties.description.value = butthole.description;
	nft.properties.butthole.value = butthole.image;
	return nft;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (require.main === module)
	main().then(async (program) => {
		await program.parseAsync(process.argv)
	    process.exit(0);
	}).catch(err => {
	    console.error(err);
	    process.exit(1);
	})
