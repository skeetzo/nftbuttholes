// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const CheekSpreader = artifacts.require("./CheekSpreader.sol");

const DONATION1 = process.env.DONATION1_DEV,
      ONE_ETH = web3.utils.toWei("1", "ether");

contract("CheekSpreader", async (accounts) => {
  const owner             = accounts[0],
        notOwner          = accounts[1];
  web3.eth.defaultAccount = owner;

  let cheekSpreader;

  before(async function () {
    // cheekSpreader              = await CheekSpreader.deployed();
    // cheekSpreader.numberFormat = 'BN';
  });

  describe('ERC721', async function () {
    
    before(async function () {
      // await cheekSpreader.send(ONE_ETH);
    });
    
    xit('can release all funds', async function () {
      let balanceBefore = parseInt((await web3.eth.getBalance(DONATION1)).toString());
      let result = await cheekSpreader.releaseAll({'from':notOwner});
      truffleAssert.eventEmitted(result, 'PaymentReleased', (ev) => {
        // assert.equal(ev["to"].toString(), DONATION1, "does not release to correct donor");
        // assert.equal(ev["amount"].toString(), 330000000000000000, "does not release correct amount");
        return true;
      });
      let balanceAfter = parseInt((await web3.eth.getBalance(DONATION1)).toString());
      console.log("balance: %s", balanceAfter);
      assert.equal(balanceBefore+parseInt(ONE_ETH), balanceAfter, "does not release correct funds amount");
    });

  });

})