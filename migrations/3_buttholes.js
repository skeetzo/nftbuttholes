const Buttholes = artifacts.require("Buttholes");

module.exports = function (deployer) {
  let defaultButthole = process.env.DEFAULT_BUTTHOLE || "";
  deployer.deploy(Buttholes, defaultButthole);
};
