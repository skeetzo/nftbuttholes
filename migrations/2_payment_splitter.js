const PaymentSplitPusher = artifacts.require("PaymentSplitPusher");

module.exports = function (deployer) {
  let payees = [];
  let shares = [];
  
  deployer.deploy(PaymentSplitPusher, payees, shares);
};
