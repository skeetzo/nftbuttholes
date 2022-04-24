// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721PresetMinterPauserAutoId.sol";
import "./ERC2981/ERC2981PerTokenRoyalties.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @title Buttholes
 * @author Skeetzo
 * @dev Stupid (non-Solana) butthole nfts.
 */
contract Buttholes is ERC721PresetMinterPauserAutoId, ERC2981PerTokenRoyalties {

  mapping(uint256 => string) public buttholes;
  uint256 public buttholesCount;
  uint256 public constant royaltyValue = 200;

  /**
   * @dev Contract constructor. Sets metadata extension `name` and `symbol`.
   */
  constructor(string memory defaultButthole) ERC721PresetMinterPauserAutoId("Butthole", "BUTT", "") {
    buttholes[0] = defaultButthole;
    buttholesCount = 1;
  }

  // ERC721 //
  
  /**
   * @dev Set proper token data for minting.
   */
  function _mint(address to, uint256 tokenId) internal {
    _setTokenRoyalty(tokenId, to, royaltyValue);
    _setTokenURI(tokenId, _getButthole());
    super._mint(to, newId);
  }

  /**
   * @dev Return a random uri.
   */
  function _getButthole() internal returns (string memory) {
    return buttholes[uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, buttholes))) % buttholesCount];
  }

  // /**
  //  * @dev Override to disable transfers for all but the contract.
  //  */
  // function _transfer(address from, address to, uint256 tokenId) internal virtual {
  //   require(to == address(this), "Buttholes: may only transfer to contract");
  //   super._transfer(from, to, tokenId);
  // }

  // Buttholes //

  /**
   * @dev Feel special.
   */
  function VIP() public returns (uint) {
    return 0;
  }

}
