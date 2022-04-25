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

  web3.eth.defaultAccount = owner;

  let Buttholes;

  before(async function () {
    Buttholes              = await Buttholes.deployed();
    Buttholes.numberFormat = 'BN';
  });

  describe('ERC721', async function () {
    
    let tokenId;

    // before(async function () {});
    
    it('can be minted', async function () {
      let result = await Buttholes.mint(notOwner, {'from':notOwner});
      truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
        console.log(ev["tokenId"]);
        assert.equal(ev["from"].toString(), blacklistedAccount, "does not mint from correct address");
        assert.equal(ev["to"].toString(), notOwner, "does not mint to correct address");
        assert.notEqual(ev["tokenId"], null, "does not provide token id");
        tokenId = ev["tokenId"];
        return true;
      });
    });
    
    it('can be burned', async function () {
      let balanceBefore = await Buttholes.balanceOf(notOwner);
      assert.equal(balanceBefore, 1, "does not prepare token for burn");
      await Buttholes.burn(tokenId, {'from':notOwner});
      let balanceAfter = await Buttholes.balanceOf(notOwner);
      assert.equal(balanceAfter, 0, "does not burn token");
    });

    it('can be paused', async function () {
      await catchRevertPause(Buttholes.pause({'from':notOwner}));
      await Buttholes.pause();
      await catchRevertPausable(Buttholes.mint(notOwner, {'from':notOwner}));
    });

    it('can be unpaused', async function () {
      await catchRevertUnpause(Buttholes.unpause({'from':notOwner}));
      await Buttholes.unpause();
      await Buttholes.mint(notOwner, {'from':notOwner});
    });
    
    it('can be traded', async function () {
      let balanceBefore1 = await Buttholes.balanceOf(notOwner);
      let balanceBefore2 = await Buttholes.balanceOf(notOwner2);
      let result = await Buttholes.safeTransferFrom(notOwner, notOwner2, tokenId);
      assert.equal(await Buttholes.balanceOf(notOwner), balanceBefore1-1, "token does not transfer out");
      assert.equal(await Buttholes.balanceOf(notOwner2), balanceBefore2+1, "token does not transfer in");
      truffleAssert.eventEmitted(result, 'TransferSingle', (ev) => {return true;});
    });
    
    it('can set token uri', async function () {
      // check that token uri has been set
      let result = await Buttholes.setButtholeURI(tokenURI);
      assert.notEqual(uri, "", "does not set token uri");
    });

    ////////////////////////////////////////////////////////////////////////////////////

    it('can mint random buttholes', async function () {
      let hash = await Buttholes.tokenURI(tokenId);
      let notDifferent = true;
      let i = 0,
          failLimit = 10;
      while (notDifferent&&i<failLimit) {
        let result = await Buttholes.mint(notOwner, {'from':notOwner});
        truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
          if (tokenId != ev["tokenId"])
            notDifferent = false;
          return true;
        });
        i++;
      }
      assert.notTrue(notDifferent, "does not mint random buttholes");
    });

  });

});
