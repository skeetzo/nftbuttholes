// custom chai plugins
const chai = require('chai');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());

const assert = require("chai").assert;

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

  web3.eth.defaultAccount = owner;

  let buttholesContract;

  before(async () => {
    buttholesContract              = await Buttholes.deployed();
    buttholesContract.numberFormat = 'BN';
  });

  // IPFS //

  describe('IPFS', async () => {

    var b;

    beforeEach(async () => {
      b = {
        'artist' : owner,
        'image' : "/home/skeetzo/Projects/nftbuttholes/images/doughnut.jpg",
        'name' : "Alex D.",
        'description' : "The man, the myth, the moron.",
        'birthday' : "06/06/1990",
        'starvingArtists' : []
      };
      const d = b.starvingArtists; 
      b = butthole.createButtholeMetadata(b);
      b.starvingArtists = d;
    });

    it('can upload image', async () => {
      let cid = await ipfs.uploadButtholeImage(b);
      assert.notEqual(cid.toString().length, 0, "does not upload image");
    });

    it('can upload metadata', async () => {
      let cid = await ipfs.uploadButtholeMetadata(b);
      assert.notEqual(cid.toString().length, 0, "does not upload metadata");
    });

    it('can find most recent', async () => {
      let butthole = await ipfs.findMostRecent(b);
      assert.notEqual(butthole, {}, "does not find most recent");
    });

    it('can upload butthole', async () => {
      let cid = await ipfs.uploadButthole(b);
      assert.notEqual(cid.toString().length, 0, "does not upload butthole");
    });

    it('can get metadata', async () => {
      let cid = await ipfs.uploadButtholeMetadata(b);
      let metadata = await ipfs.getButtholeFromIPFS(cid);
      assert.notEqual(metadata.properties.name.value, b.name, "does not get metadata");
    });

    it('can get image', async () => {
      let cid = await ipfs.uploadButtholeImage(b);
      let image = await ipfs.getButtholeImageFromIPFS(cid);
      assert.notEqual(image.toString().length, 0, "does not get image");
    });

  });

  // Buttholes Interface via CLI //

  describe('Interface', async () => {

    var b = {
      'artist' : owner,
      'image' : "/home/skeetzo/Projects/nftbuttholes/images/doughnut.jpg",
      'name' : "Alex D.",
      'description' : "The man, the myth, the moron.",
      'birthday' : "06/06/1990",
      'starvingArtists' : []
    };

    it('can add buttholes', async () => {
      let successful = false; 
      for (let i=0;i<accounts.length&&!successful;i++) {
        successful = await butthole.add(b);
        b.artist = accounts[i];
      }
      assert.equal(successful, true, "does not add buttholes");
    });

    it('can add minters', async () => {
      assert.equal(await butthole.addMinter(), true, "does not add minter");
    });

    it('can check admin', async () => {
      assert.equal(await butthole.isAdmin(owner), true, "does not check if admin");
    });

    it('can check minter', async () => {
      assert.equal(await butthole.isMinter(owner), true, "does not check if minter");
    });

    it('can mint', async () => {
      assert.equal(await butthole.mint(owner), true, "does not mint butthole");
      assert.equal(await butthole.mint(notOwner), true, "does not mint butthole");
    });

    it('can update', async () => {
      assert.equal(await butthole.update(b), true, "does not update starving artists");
    });

    it('can renounce', async () => {
      assert.equal(await butthole.renounce(), true, "does not renounce butthole");
    });

  });

});