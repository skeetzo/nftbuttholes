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
    let tokenURI = "hash",
        tokenURI2 = "hashhash";

    before(async () => {
      // grant mint role to notOwner
      await buttholes.addMinter({'from':notOwner});
    });

    it('can add buttholes', async () => {
      let result = await buttholes.addButthole(owner, tokenURI);
      truffleAssert.eventEmitted(result, 'PuckerUp', (ev) => {
        assert.equal(ev["addedButthole"].toString(), owner, "does not add butthole owner");
        assert.equal(ev["buttholeHash"].toString(), tokenURI, "does not set butthole hash");
        return true;
      });
      await catchOwnable(buttholes.addButthole(notOwner, tokenURI, {'from':notOwner}));
      result = await buttholes.addButthole(notOwner, tokenURI2, {'from':owner});
      truffleAssert.eventEmitted(result, 'PuckerUp', (ev) => {
        assert.equal(ev["addedButthole"].toString(), notOwner, "does not add butthole owner2");
        assert.equal(ev["buttholeHash"].toString(), tokenURI2, "does not set butthole hash");
        return true;
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////
    
    it('can be minted', async () => {
      let result = await buttholes.mint(owner);
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
        assert.equal(ev["to"].toString(), owner, "does not mint to correct address");
        assert.notEqual(ev["tokenId"], null, "does not provide token id");
        tokenId = parseInt(ev["tokenId"].toString());
        return true;
      });
      result = await buttholes.mint(notOwner, {'from':notOwner});
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
        assert.equal(ev["to"].toString(), notOwner, "does not mint to correct address");
        assert.notEqual(ev["tokenId"], null, "does not provide token id");
        // tokenId = parseInt(ev["tokenId"].toString());
        return true;
      });
    });
    
    it('can be paused', async () => {
      await catchRevertPause(buttholes.pause({'from':notOwner}));
      let result = await buttholes.pause();
      truffleAssert.eventEmitted(result, 'Paused', (ev) => {
        assert.equal(ev["account"].toString(), owner, "does not pause");
        return true;
      });
    });

    it('can be unpaused', async () => {
      await catchRevertUnpause(buttholes.unpause({'from':notOwner}));
      let result = await buttholes.unpause();
      truffleAssert.eventEmitted(result, 'Unpaused', (ev) => {
        assert.equal(ev["account"].toString(), owner, "does not unpause");
        return true;
      });
      await buttholes.mint(notOwner, {'from':notOwner});
    });
    
    it('can be traded', async () => {
      let balanceBefore1 = await buttholes.balanceOf(owner);
      let balanceBefore2 = await buttholes.balanceOf(notOwner);
      // console.log("old balances: %s - %s", balanceBefore1, balanceBefore2);
      let result = await buttholes.safeTransferFrom(owner, notOwner, tokenId, {'from': owner});
      assert.equal((await buttholes.balanceOf(owner)).toString(), parseInt(balanceBefore1)-1, "token does not transfer out");
      assert.equal((await buttholes.balanceOf(notOwner)).toString(), parseInt(balanceBefore2)+1, "token does not transfer in");
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {return true;});
      // console.log("new balances: %s - %s", await buttholes.balanceOf(notOwner), await buttholes.balanceOf(notOwner));
      //
      result = await buttholes.safeTransferFrom(notOwner, owner, tokenId, {'from': notOwner});
      assert.equal((await buttholes.balanceOf(notOwner)).toString(), parseInt(balanceBefore2), "token does not transfer out");
      assert.equal((await buttholes.balanceOf(owner)).toString(), parseInt(balanceBefore1), "token does not transfer in");
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {return true;});
      // console.log("final balances: %s - %s", balanceBefore1, balanceBefore2);
    });

    ////////////////////////////////////////////////////////////////////////////////////

    it('can mint random buttholes', async () => {
      let hash = await buttholes.tokenURI(tokenId);
      let notDifferent = true;
      let i = 0,
          failLimit = 100;
      while (notDifferent&&i<failLimit) {
        // console.log("minting...")
        let result = await buttholes.mint(notOwner, {'from':notOwner});
        i++;
        truffleAssert.eventEmitted(result, 'Transfer', async (ev) => {
          // console.log("uri for token id: %s", ev["tokenId"].toString())
          let uri = await buttholes.tokenURI(ev["tokenId"].toString());
          // console.log("uri vs hash: %s - %s", uri, hash);
          if (uri != hash)
            notDifferent = false;
          return true;
        });
      }
      assert.equal(notDifferent, false, "does not mint random buttholes");
    });

    ////////////////////////////////////////////////////////////////////////////////////

    it('can be burned', async () => {
      let balanceBefore = parseInt((await buttholes.balanceOf(owner)).toString());
      assert.notEqual(balanceBefore, 0, "does not prepare a token for burn");
      await buttholes.burn(tokenId);
      let balanceAfter = parseInt((await buttholes.balanceOf(owner)).toString());
      assert.equal(balanceAfter, balanceBefore-1, "does not burn token");
    });

  });

});
