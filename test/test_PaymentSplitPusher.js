// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const Exceptions = require("../src/web3/exceptions");

const PaymentSplitPusher = artifacts.require("./PaymentSplitPusher.sol");

contract("PaymentSplitPusher", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        notOwner2         = accounts[2];

  web3.eth.defaultAccount = owner;

  let PaymentSplitPusher;

  before(async () => {
    PaymentSplitPusher              = await PaymentSplitPusher.deployed();
    PaymentSplitPusher.numberFormat = 'BN';
  });

  describe('ERC721', async () => {
    
    let tokenId;

    before(async () => {});
    
    it('can', async () => {});

  });

})