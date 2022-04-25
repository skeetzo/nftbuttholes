// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const Exceptions = require("../js/exceptions.js");

const PaymentSplitPusher = artifacts.require("./PaymentSplitPusher.sol");

contract("PaymentSplitPusher", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        donationAddress1  = accounts[2],
        donationAddress2  = accounts[3],
        donationAddress3  = accounts[4],
        donationAddress4  = accounts[5];

  web3.eth.defaultAccount = owner;

  let PaymentSplitPusher;

  before(async function () {
    PaymentSplitPusher              = await PaymentSplitPusher.deployed();
    // PaymentSplitPusher.numberFormat = 'BN';
  });

  describe('ERC721', async function () {
    
    let tokenId;

    before(async function () {});
    
    it('can release all funds', async function () {
      let balanceBefore = await web3.eth.balanceOf(donationAddress1);
      // assert.equal(balanceBefore, 0, "does not prepare funds");
      // TODO
        // do payments / mint nfts
      //
      await PaymentSplitPusher.releaseAll(owner, {'from':notOwner});
      let balanceAfter = await web3.eth.balanceOf(donationAddress1);
      assert.notEqual(balanceAfter, 0, "does not release funds");
    });

  });

})