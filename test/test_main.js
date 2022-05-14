const atomus = require('atomus');
// custom chai plugins
const chai = require('chai');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const chaiAlmost = require('chai-almost');
chai.use(chaiAlmost());
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

// fetch shim
global.fetch = require("node-fetch");

const CupidCountdownContract = artifacts.require("./Buttholes.sol");

contract("Buttholes", async (accounts) => {

  const owner             = accounts[0],
        notOwner          = accounts[1],
        notOwner2         = accounts[2],
        donor1            = accounts[3],
        donor2            = accounts[4],
        donor3            = accounts[5];

  web3.eth.defaultAccount = owner;

	let buttholes;

  before(async () => {
    buttholes              = await Buttholes.deployed();
    buttholes.numberFormat = 'BN';
  });

	describe("Client", function () {

		var browser, $;

		beforeEach(function (done) {
			var htmlStr = fs.readFileSync('../index.html').toString('utf8');
			browser = atomus()
				.html(htmlStr)
				.ready(function(errors, window) {
				  $ = window.$;
				  browser.window.ethereum = "http://127.0.0.1:8545";
				  done();
			  });
		});

		it("can connect wallet", function (done) {
	    expect($('#account').innerHTML).to.be.equal(undefined);
	    $('#connect').on('click', function() {
				expect($('#account').innerHTML).to.be.equal(accounts[0]);
		    done();
	    });
	    browser.clicked($('#connect'));
		});


		// TODO

		it("can add butthole", function (done) {
			$('#add').on('click', function() {
		    done();
	    });
	    browser.clicked($('#add'));
		});

		it("can add minter", function () {
			$('#add').on('click', function() {
		    done();
	    });
	    browser.clicked($('#add'));
		});

		it("can mint", function () {
			$('#add').on('click', function() {
		    done();
	    });
	    browser.clicked($('#add'));
		});

		it("can update", function () {
			$('#add').on('click', function() {
		    done();
	    });
	    browser.clicked($('#add'));
		});

		it("can renounce", function () {
			$('#add').on('click', function() {
		    done();
	    });
	    browser.clicked($('#add'));
		});



			// let quantity = $('#arrows').innerHTML;
			// console.log(`quantity: ${quantity}`)
		 //    expect(quantity).to.be.equal(undefined);
		 //    $('#arrow').on('click', function() {
			//     $('#confirmButton').on('click', function() {
			// 		// check item quantity changes
			// 		console.log(`arrows: ${$('#arrows').innerHTML}`)
			// 		console.log(parseInt(quantity)+1);
			// 	    expect($('#arrows').innerHTML).to.be.equal(parseInt(quantity)+1);
			// 	    done()
			//     });
			//     // click ok to confirm
			//     browser.clicked($('#confirmButton'));
		 //    });
		 //    browser.clicked($('#arrow'));





	});

});