// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @title PaymentSplitPusher
 * @author Skeetzo
 * @dev Pushes instead of pulls.
 */
contract PaymentSplitPusher is PaymentSplitter {

  /**
   * @dev 
   */
  constructor(address[] memory payees, uint256[] memory shares_) PaymentSplitter(payees, shares_) {}

}