const commander = require('commander'),
	  Command = commander.Command;

const { add, confirm, mint, update, renounce } = require('./butthole.js');

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

async function promptForMissing(cliOptions, prompts) {
    const questions = []
    for (const [name, prompt] of Object.entries(prompts)) {
        prompt.name = name;
        prompt.when = (answers) => {
            if (cliOptions[name]) {
                answers[name] = cliOptions[name]
                return false
            }
            return true
        }
        questions.push(prompt);
    }
    return inquirer.prompt(questions);
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
	  .description('Add a butthole.')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .argument('<image>', 'The local path to the butthole image')
	  .option('-n, --name <string>', 'The artist\'s name')
	  .option('-d, --description <string>', 'The artist\'s description')
	  .option('-b, --birthday <date>', 'The artist\'s birthday (MM/DD/YYYY)', parseDate)
	  .option('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole add 0x00.. /path/to/image.jpg -n "My Name" -d "A description." -b "06/06/1990 -s 0x01.. 0x02.. 0x03..`)
	  .action(async (artist, image, options) => {
	  	await add({
	  		'artist' : artist,
		  	'image' : image,
		  	'name' : options.name,
		  	'description' : options.description,
		  	'birthday' : options.birthday,
		  	'starvingArtists' : options.starve	
	  	});
	  });

	program.command('confirm')
	  .description('Add caller as a minter to confirm 18+ age requirement.')
	  .action(confirm);

	program.command('mint <image-path>')
	  .description('Mint a butthole.')
	  .argument('<address>', 'The receiving address.', parseAddress)
	  .addHelpText('after', `
Example call:
 $ butthole mint 0x00.. `)
	  .action(async (to) => {
	  	await mint(to);
	  });

	program.command('update')
	  .description('Update your starving artist(s).')
	  .argument('<address>', 'The butthole artist\'s ETH address', parseAddress)
	  .requiredOption('-s, --starve [addresses...]', 'Up to 3 starving artist ETH addresses', 'specify at least 1 starving artist')
	  .addHelpText('after', `
Example call:
 $ butthole update 0x00.. -s 0x01.. 0x02.. 0x03..`)
	  .action(async (artist, options) => {
	  	await update({
	  		'artist' : artist,
			'starvingArtists' : options.starve
	  	});
	  });

	program.command('renounce')
	  .description('Renounce your butthole.')
	  .action(renounce);

	return program;
}
module.exports = main;

if (require.main === module) {
    // console.log('called directly');
	main().then(async (program) => {
		await program.parseAsync(process.argv)
	    process.exit(0);
	}).catch(err => {
	    console.error(err);
	    process.exit(1);
	})
} else {
    // console.log('required as a module');
}