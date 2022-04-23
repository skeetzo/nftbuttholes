const logger = require('../modules/log').logger;

module.exports.getPriceOfETH = async function() {
	return await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
	  .then(resp => resp.json())
	  .then(data => {
	    logger.debug("price of ETH: "+data.ethereum.usd);
	    // turn default login fee into price in ETH
	    logger.debug("usd: "+usd);
	    return parseFloat(1 / parseInt(data.ethereum.usd)).toFixed(8);
	  });
}