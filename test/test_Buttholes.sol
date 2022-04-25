// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../src/contracts/Buttholes.sol";

contract TestButtholes {

  function testButtholesContract() public {
    Buttholes Buttholes = Buttholes(DeployedAddresses.Buttholes());
  }

  function testRoyaltyInfo() public {

    Buttholes Buttholes = new Buttholes();

    bool r;
    // We're basically calling our contract externally with a raw call, forwarding all available gas, with
    // msg.data equal to the throwing function selector that we want to be sure throws and using only the boolean
    // value associated with the message call's success
    (r, ) = address(this).call(abi.encodePacked(Buttholes.royaltyInfo(tokenId, 100).selector));

    // update with correct value for amount for royalty if it's not 1
    Assert.isEqual(r, 1, "Buttholes#testBurn: should return correct amount for royalty");
  }

  // TODO
  // add test for 
    // function _existingButthole(address butthole) internal view virtual returns (bool) {


  //////////////////////////////////////////////////////////////////////////////////////////

}
