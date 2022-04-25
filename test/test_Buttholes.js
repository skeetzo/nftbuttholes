// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

const Exceptions = require("../js/exceptions.js");
const catchRevertPausable = Exceptions.catchRevertPausable,
      catchRevertPause = Exceptions.catchRevertPause,
      catchRevertUnpause = Exceptions.catchRevertUnpause,
      catchOwnable = Exceptions.catchOwnable;

const Buttholes = artifacts.require("./Buttholes.sol");

contract("Buttholes", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        notOwner2         = accounts[2];

  web3.eth.defaultAccount = owner;

  let buttholes;

  before(async () => {
    buttholes              = await Buttholes.deployed();
    buttholes.numberFormat = 'BN';
  });

  describe('ERC721', async () => {
    
    let tokenId;
    let tokenURI = "hash";

    before(async () => {
      // grant mint role to notOwner
      await buttholes.addMinter({'from':notOwner});
    });

    it('can add buttholes', async () => {
      await buttholes.addButthole(owner, process.env.DEFAULT_BUTTHOLE);
      await catchOwnable(buttholes.addButthole(owner, process.env.DEFAULT_BUTTHOLE, {'from':notOwner}));
    });

    //
    
    it('can be minted', async () => {
      let result = await buttholes.mint(notOwner, {'from':notOwner});
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
        assert.equal(ev["to"].toString(), notOwner, "does not mint to correct address");
        assert.notEqual(ev["tokenId"], null, "does not provide token id");
        tokenId = parseInt(ev["tokenId"].toString());
        return true;
      });
    });
    
    it('can be paused', async () => {
      await catchRevertPause(buttholes.pause({'from':notOwner}));
      await buttholes.pause();
      await catchRevertPausable(buttholes.mint(notOwner, {'from':notOwner}));
    });

    it('can be unpaused', async () => {
      await catchRevertUnpause(buttholes.unpause({'from':notOwner}));
      await buttholes.unpause();
      await buttholes.mint(notOwner, {'from':notOwner});
    });
    
    it('can be traded', async () => {
      let balanceBefore1 = await buttholes.balanceOf(notOwner);
      let balanceBefore2 = await buttholes.balanceOf(notOwner2);
      console.log("old balances: %s - %s", balanceBefore1, balanceBefore2);
      let result = await buttholes.safeTransferFrom(notOwner, notOwner2, tokenId, {'from': notOwner});
      assert.equal((await buttholes.balanceOf(notOwner)).toString(), parseInt(balanceBefore1)-1, "token does not transfer out");
      assert.equal((await buttholes.balanceOf(notOwner2)).toString(), parseInt(balanceBefore2)+1, "token does not transfer in");
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {return true;});
      console.log("new balances: %s - %s", await buttholes.balanceOf(notOwner), await buttholes.balanceOf(notOwner2));
      //
      result = await buttholes.safeTransferFrom(notOwner2, notOwner, tokenId, {'from': notOwner2});
      assert.equal((await buttholes.balanceOf(notOwner2)).toString(), parseInt(balanceBefore2), "token does not transfer out");
      assert.equal((await buttholes.balanceOf(notOwner)).toString(), parseInt(balanceBefore1), "token does not transfer in");
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {return true;});
      console.log("final balances: %s - %s", balanceBefore1, balanceBefore2);
    });
    
    it('can set token uri', async () => {
      let uri = await buttholes.tokenURI(tokenId);
      console.log("old uri: %s", uri);
      // check that token uri has been set
      let result = await buttholes.setButtholeURI(tokenURI);
      let uri2 = await buttholes.tokenURI(tokenId);
      console.log("new uri: %s", uri2);
      assert.notEqual(uri.toString(), uri2.toString(), "does not set token uri");
      assert.equal(uri2, tokenURI, "does not set token uri");
    });

    it('can be burned', async () => {
      let balanceBefore = await buttholes.balanceOf(notOwner);
      assert.equal(balanceBefore, 1, "does not prepare token for burn");
      await buttholes.burn(tokenId, {'from':notOwner});
      let balanceAfter = await buttholes.balanceOf(notOwner);
      assert.equal(balanceAfter, 0, "does not burn token");
    });

    ////////////////////////////////////////////////////////////////////////////////////

    it('can mint random buttholes', async () => {
      let hash = await buttholes.tokenURI(tokenId);
      let notDifferent = true;
      let i = 0,
          failLimit = 10;
      while (notDifferent&&i<failLimit) {
        console.log("minting...")
        let result = await buttholes.mint(notOwner, {'from':notOwner});
        truffleAssert.eventEmitted(result, 'Transfer', async (ev) => {
          let uri = await buttholes.tokenURI(ev["tokenId"].toString());
          console.log("uri vs hash: %s - %s", ev["tokenId"].toString(), hash);
          if (uri != hash)
            notDifferent = false;
          return true;
        });
        i++;
      }
      assert.equal(notDifferent, false, "does not mint random buttholes");
    });

  });

});
