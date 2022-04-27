const Buttholes = artifacts.require("Buttholes");
const PaymentSplitPusher = artifacts.require("PaymentSplitPusher");

module.exports = async function (deployer) {
  // console.log("Deploying: PaymentSplitPusher")
  // let payees = [process.env.DEFAULT_OWNER, process.env.DONATION1_DEV, process.env.DONATION2_DEV, process.env.DONATION3_DEV];
  // let shares = [1,33,33,33];
  // console.log("payees: %s\nshares: %s", payees, shares);
  // await deployer.deploy(PaymentSplitPusher, payees, shares);
  // const paymentSplitPusher = await PaymentSplitPusher.deployed();
  // console.log("address: %s", paymentSplitPusher.address);

  
  console.log("Deploying: Buttholes")
  let baseURI = process.env.BASE_URI || "ipfs://";
  console.log("baseURI: %s", baseURI);
  await deployer.deploy(Buttholes, baseURI);
};