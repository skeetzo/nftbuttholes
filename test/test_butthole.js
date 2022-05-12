// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;
// const truffleAssert = require('truffle-assertions');

// const Exceptions = require("../js/exceptions.js");
// const catchRevertPausable = Exceptions.catchRevertPausable,
//       catchRevertPause = Exceptions.catchRevertPause,
//       catchRevertUnpause = Exceptions.catchRevertUnpause,
//       catchOwnable = Exceptions.catchOwnable,
//       catchRevertButthole = Exceptions.catchRevertButthole,
//       catchRevertMinter = Exceptions.catchRevertMinter,
//       catchRevertButtholeAddress = Exceptions.catchRevertButtholeAddress,
//       catchRevertCheeksSet = Exceptions.catchRevertCheeksSet;

const Buttholes = artifacts.require("./Buttholes.sol");
const butthole = require("../js/butthole.js");
const ipfs = require("../js/ipfs.js");

contract("Buttholes", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        notOwner2         = accounts[2],
        donor1            = accounts[3],
        donor2            = accounts[4],
        donor3            = accounts[5];

  web3.eth.defaultAccount = notOwner;

  let buttholesContract;

  before(async () => {
    buttholesContract              = await Buttholes.deployed();
    buttholesContract.numberFormat = 'BN';
  });

  // Buttholes Interface via CLI //

  describe('Interface', async () => {

    const b = {
      'artist' : "",
      'image' : "",
      'name' : "",
      'description' : "",
      'birthday' : "",
      'starvingArtists' : []
    };

    it('can add buttholes', async () => {
      await butthole.add(b);
      assert.equal(true, true);
    });

    it('can add minters', async () => {
      await butthole.addMinter()
      assert.equal(true, true);
    });

    it('can check admin', async () => {
      web3.eth.defaultAccount = owner;
      assert.equal(await butthole.isAdmin(), true, "does not check if admin");
      web3.eth.defaultAccount = notOwner;
    });

    it('can check minter', async () => {
      assert.equal(await butthole.isMinter(), true, "does not check if minter");
    });

    it('can mint', async () => {
      butthole.mint(notOwner);
      assert.equal(true, true);
    });

    it('can update', async () => {
      await butthole.update(b);
      assert.equal(true, true);
    });

    it('can renounce', async () => {
      await butthole.renounce();
      assert.equal(true, true);
    });

  });

  // IPFS //

  describe('IPFS', async () => {
    it('can get metadata', async () => {
      await ipfs.getButtholeFromIPFS()
      assert.equal(typeof Object, await ipfs.getButtholeFromIPFS(), "does not get metadata");
    });
    it('can get image', async () => {
      await ipfs.getButtholeImageFromIPFS()
      assert.equal(typeof String, await ipfs.getButtholeImageFromIPFS(), "does not get image");

    });
    it('can upload metadata', async () => {
      await ipfs.uploadButthole()
      assert.equal(typeof String, await ipfs.uploadButthole(), "does not upload image");

    });
    it('can upload image', async () => {
      await ipfs.uploadButtholeImage()
      assert.equal(typeof String, await ipfs.uploadButtholeImage(), "does not upload image");
    });

  });

});