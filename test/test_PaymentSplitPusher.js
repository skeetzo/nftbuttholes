// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const PaymentSplitPusher = artifacts.require("./PaymentSplitPusher.sol");

const DONATION1 = process.env.DONATION1_DEV,
      ONE_ETH = web3.utils.toWei("1", "ether");

contract("PaymentSplitPusher", async (accounts) => {
  const owner             = accounts[0],
        notOwner          = accounts[1];
  web3.eth.defaultAccount = owner;

  let paymentSplitPusher;

  before(async function () {
    paymentSplitPusher              = await PaymentSplitPusher.deployed();
    PaymentSplitPusher.numberFormat = 'BN';
  });

  describe('ERC721', async function () {
    
    before(async function () {
      await paymentSplitPusher.send(ONE_ETH);
    });
    
    it('can release all funds', async function () {
      let balanceBefore = parseInt((await web3.eth.getBalance(DONATION1)).toString());
      let result = await paymentSplitPusher.releaseAll({'from':notOwner});
      truffleAssert.eventEmitted(result, 'PaymentReleased', (ev) => {
        assert.equal(ev["to"].toString(), DONATION1, "does not release to correct donor");
        assert.equal(ev["amount"].toString(), ONE_ETH, "does not release correct amount");
        return true;
      });
      let balanceAfter = parseInt((await web3.eth.getBalance(DONATION1)).toString());
      console.log("balance: %s", balanceAfter);
      assert.equal(balanceBefore+parseInt(ONE_ETH), balanceAfter, "does not release correct funds amount");
    });

  });

})