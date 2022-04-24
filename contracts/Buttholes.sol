// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @title Buttholes
 * @author Skeetzo
 * @dev Stupid (non-Solana) butthole nfts.
 */
contract Buttholes is ERC721PresetMinterPauserAutoId, ERC721Royalty, WhitelistedRole {

  // public image uri
  string public constant buttholeFlap;

  // index of uris -??? i think i need to update this when i update whos allowed to upload their butthole
  mapping(address => string) public buttholes;

  // unique butthole owners
  address[] buttholeOwners;

  // number of butthole pics
  uint256 public buttholesCount;

  // royalty fee - 2%
  uint256 public constant royaltyValue = 200;

  /**
   * @dev Contract constructor. Sets metadata extension `name` and `symbol`.
   */
  constructor(string memory defaultButthole, string memory buttFlap) ERC721PresetMinterPauserAutoId("Butthole", "BUTT", "") {
    buttholeFlap = buttFlap;
    buttholeOwners.push(address(this));
    buttholes[address(this)] = defaultButthole;
    buttholesCount = 1;
  }

  // Buttholes //

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function addButthole(string memory _tokenURI) public {
    // TODO
    // butthole owner must not already exist
    // require(!_exists(_msgSender()), "Buttholes: URI add of preexisting account");

    buttholes[_msgSender()] = _tokenURI;
    buttholesCount+=1;
    buttholeOwners.push(_msgSender());
  }

  /**
   * @dev Feel special.
   */
  function VIP() public returns (uint) {
    return 0;
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
    return buttholeOwners[uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, buttholeOwners))) % buttholesCount];
  }

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function _setButtholeURI(string memory _tokenURI) public {
    require(_exists(_msgSender()), "Buttholes: URI set of nonexistent account");
    buttholes[_msgSender()] = _tokenURI;
  }

}
