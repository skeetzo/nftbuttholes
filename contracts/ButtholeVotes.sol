// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Butthole is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, AccessControl, ERC721Burnable, ERC721Royalty, ERC721Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    // royalty fee - 5%
    uint96 public constant royaltyValue = 200;

    constructor(string memory name_, string memory symbol_, address pauser) ERC721(name_, symbol_) {
      _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _grantRole(PAUSER_ROLE, pauser);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
      _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
      _unpause();
    }

    function safeMint(address to, string memory uri) public {
      uint256 tokenId = _nextTokenId++;
      _safeMint(to, tokenId);
      _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
      internal
      override(ERC721, ERC721Enumerable, ERC721Pausable)
      returns (address)
    {
      return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
      internal
      override(ERC721, ERC721Enumerable)
    {
      super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
      public
      view
      override(ERC721, ERC721URIStorage)
      returns (string memory)
    {
      return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
      returns (bool)
    {
      return super.supportsInterface(interfaceId);
    }
}
