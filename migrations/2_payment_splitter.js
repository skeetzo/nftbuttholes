const PaymentSplitPusher = artifacts.require("PaymentSplitPusher");

module.exports = async function (deployer) {
  let payees = [process.env.DEFAULT_OWNER];
  let shares = [100];
  console.log("payees: %s\nshares: %s", payees, shares);
  await deployer.deploy(PaymentSplitPusher, payees, shares);
};
