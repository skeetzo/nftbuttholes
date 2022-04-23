// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const Exceptions = require("../src/web3/exceptions");
const catchRevertPausable = Exceptions.catchRevertPausable,
      catchRevertPause = Exceptions.catchRevertPause,
      catchRevertUnpause = Exceptions.catchRevertUnpause;

const Buttholes = artifacts.require("./Buttholes.sol");

contract("Buttholes", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        notOwner2         = accounts[2];

  web3.eth.defaultAccount = notOwner;

  let Buttholes;

  before(async () => {
    Buttholes              = await Buttholes.deployed();
    Buttholes.numberFormat = 'BN';
  });

  describe('ERC721', async () => {
    
    let tokenId;

    before(async () => {});
    
    it('can be minted', async () => {
      let minting = await Buttholes.mint(notOwner);
      truffleAssert.eventEmitted(minting, 'Transfer', (ev) => {
        console.log(ev["tokenId"]);
        assert.equal(ev["from"].toString(), blacklistedAccount, "does not mint from correct address");
        assert.equal(ev["to"].toString(), notOwner, "does not mint to correct address");
        assert.notEqual(ev["tokenId"], null, "does not provide token id");
        tokenId = ev["tokenId"];
        return true;
      });
    });
    
    it('can be burned', async () => {
      let balanceBefore = await Buttholes.balanceOf(notOwner);
      assert.equal(balanceBefore, 1, "does not prepare token for burn");
      await Buttholes.burn(tokenId, {'from':notOwner});
      let balanceAfter = await Buttholes.balanceOf(notOwner);
      assert.equal(balanceAfter, 0, "does not burn token");
    });

    it('can be paused', async () => {
      await catchRevertPause(Buttholes.pause({'from':notOwner}));
      await Buttholes.pause();
      let minting = await Buttholes.mint(notOwner);
      // finish here
    });

    it('can be unpaused', async () => {
      await catchRevertUnpause(Buttholes.unpause({'from':notOwner}));
      await Buttholes.unpause();
      let minting = await Buttholes.mint(notOwner);
      // finish here
    });
    
    xit('can be traded', async () => {
      let balanceBefore1 = await Buttholes.balanceOf(notOwner);
      let balanceBefore2 = await Buttholes.balanceOf(notOwner2);
      let result = await Buttholes.safeTransferFrom(notOwner, notOwner2, tokenId);
      assert.equal(await Buttholes.balanceOf(notOwner), balanceBefore1-1, "token does not transfer out");
      assert.equal(await Buttholes.balanceOf(notOwner2), balanceBefore2+1, "token does not transfer in");
      truffleAssert.eventEmitted(result, 'TransferSingle', (ev) => {return true;});
    });

    it('can only be returned to contract', async () => {
      await catchRevertTransfer(Buttholes.safeTransferFrom(notOwner, notOwner2, tokenId));
      let balanceBefore1 = await Buttholes.balanceOf(notOwner);
      let balanceBefore2 = await Buttholes.balanceOf(Buttholes.address);
      let result = await Buttholes.safeTransferFrom(notOwner, Buttholes.address, tokenId);
      assert.equal(await Buttholes.balanceOf(notOwner), balanceBefore1-1, "token does not transfer out");
      assert.equal(await Buttholes.balanceOf(Buttholes.address), balanceBefore2+1, "token does not transfer in");
    });
    
    it('can set token uri', async () => {
      // check that token uri has been set
      let correctURI = "";
      let uri = await Buttholes.tokenURI(tokenId);
      assert.equal(uri, correctURI, "does not set token uri");
    });

  });

});
