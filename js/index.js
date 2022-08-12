const commander = require('commander'),
	  Command = commander.Command;
const path = require('path');

const { add, confirm, getButthole, mint, update, renounce } = require('./butthole.js');

// TODO
// this will totally not work
// figure out how to require the helpers correctly or move them to minty
const { MakeMinty } = require('minty-fresh');
const CONTRACT_NAME = "Buttholes";

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
	  .description('Add a butthole template of a performer for minting. Caller must be contract owner.')
            .description('add an NFT schema to IPFS as an available template')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .argument('<image>', 'The local path to the butthole image')
	  .option('-n, --name <string>', 'The artist\'s name')
	  .option('-d, --description <string>', 'The artist\'s description')
	  .option('-b, --birthday <date>', 'The artist\'s birthday (MM/DD/YYYY)', parseDate)
	  .option('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole add 0x00.. /path/to/image.jpg -n "My Name" -d "A description." -b "06/06/1990 -s 0x01.. 0x02.. 0x03..`)
	  .action(addButthole);

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
	  .action(mintButthole);

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

	const rootDir = path.join(__dirname, '..');
	process.chdir(rootDir);

	return program;
}
module.exports = main;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ---- command action functions

async function addButthole(artist, image, options) {
    const minty = await MakeMinty(CONTRACT_NAME);
    const {assetCid, assetURI, assetGatewayURL} = await minty.uploadAssetData(image, "buttholes");
    options.artist = artist;
    options.image = assetCid;
  	const schema = await selectSchema("butthole");
	const butthole = await promptNFTMetadata(schema, options);
    await add(butthole);
    console.log('🌿 Added a new butthole: ');
    alignOutput(
        ['Contract Name:', chalk.green(minty.name)],
        ['Contract Address:', chalk.yellow(minty.contract.address)],
        ['Butthole Artist:', chalk.green(artist)],
        ['Asset Address:', chalk.blue(assetURI)],
        ['Asset Gateway URL:', chalk.blue(assetGatewayURL)]);
    console.log(colorize(JSON.stringify(butthole), colorizeOptions));
}

async function mintButthole(options) {
    const minty = await MakeMinty(CONTRACT_NAME);
    options.schema = "butthole";
    options.skipMint = true;
    if (options.random) options.butthole = -1;
    options.butthole = await getButthole(options.butthole);
    const nft = await minty.createNFT(options);
    await mint(options.address, nft.metadataURI);
    console.log('🌿 Minted a new butthole: ');
    alignOutput(
        ['Contract Name:', chalk.green(minty.name)],
        ['Contract Address:', chalk.yellow(minty.contract.address)],
        ['Token ID:', chalk.green(nft.tokenId)],
        ['Metadata Address:', chalk.blue(nft.metadataURI)],
        ['Metadata Gateway URL:', chalk.blue(nft.metadataGatewayURL)],
        ['Asset Address:', chalk.blue(nft.assetURI)],
        ['Asset Gateway URL:', chalk.blue(nft.assetGatewayURL)]);
    console.log(colorize(JSON.stringify(nft.metadata), colorizeOptions));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helpers //

// ensure value is an 0x address
function parseAddress(value) {
	if (!ethers.utils.isAddress(value))
	    throw new commander.InvalidArgumentError('Not an ETH address.');
	return value;
}

function parseId(value) {
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

function alignOutput(labelValuePairs) {
    const maxLabelLength = labelValuePairs
      .map(([l, _]) => l.length)
      .reduce((len, max) => len > max ? len : max);
    for (const [label, value] of labelValuePairs) {
        console.log(label.padEnd(maxLabelLength+1), value);
    }
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
