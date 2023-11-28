const Buttholes = artifacts.require("Buttholes");

module.exports = async function (deployer) {
  console.log("Deploying: Buttholes")
  let baseURI = process.env.BASE_URI || "ipfs://";
  console.log("baseURI: %s", baseURI);
  await deployer.deploy(Buttholes, baseURI);
};