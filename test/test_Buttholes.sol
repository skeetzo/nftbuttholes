// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Buttholes.sol";

contract TestButtholes {

  function testButtholesContract() public {
    Buttholes buttholes = Buttholes(DeployedAddresses.Buttholes());
  }

  function testRoyaltyInfo() public {

    Buttholes buttholes = new Buttholes("", "", "", payable(address(this)));

    bool r;
    // We're basically calling our contract externally with a raw call, forwarding all available gas, with
    // msg.data equal to the throwing function selector that we want to be sure throws and using only the boolean
    // value associated with the message call's success
    // (r, ) = address(this).call(abi.encodePacked(buttholes.royaltyInfo(1, 100).selector));

    // update with correct value for amount for royalty if it's not 1
    // Assert.isEqual(r, 1, "Buttholes#testRoyaltyInfo: should return correct amount for royalty");
  }

  // TODO
  // add test for 
    // function _existingButthole(address butthole) internal view virtual returns (bool) {


  //////////////////////////////////////////////////////////////////////////////////////////

}
