const Buttholes = artifacts.require("Buttholes");

module.exports = async function (deployer) {
  let defaultButthole = process.env.DEFAULT_BUTTHOLE || "";
  let defaultButtflap = process.env.DEFAULT_BUTTFLAP || "";
  let baseURI = process.env.BASE_URI || "ipfs://";
  console.log("butthole: %s\nbuttflap: %s\nbaseURI: %s", defaultButthole, defaultButtflap, baseURI);

  // TODO
  // let paymentSplitPusher = the address from previous deployment


  await deployer.deploy(Buttholes, defaultButthole, defaultButtflap, baseURI, paymentSplitPusher);
};