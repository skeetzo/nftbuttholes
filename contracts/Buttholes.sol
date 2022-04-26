// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

/**
 * @title Buttholes
 * @author Skeetzo
 * @dev Stupid (non-Solana) butthole nfts.
 */
contract Buttholes is Ownable, ERC721URIStorage, ERC721Royalty, ERC721PresetMinterPauserAutoId {

  event PuckerUp(address addedButthole, string buttholeHash);
  // event PuckerDown(address removedButthole);

  // butthole hashes
  mapping(address => string) public buttholes;
  // account quick mapping
  mapping(address => bool) public buttholeMap;
  // unique butthole owners
  address[] buttholeOwners;
  // royalty fee - 5%
  uint96 public constant royaltyValue = 200;

  /**
   * @dev Contract constructor. Sets metadata extension `name` and `symbol`.
   */
  constructor(string memory baseURI_, address payable paymentSplitPusher) ERC721PresetMinterPauserAutoId("Butthole", "BUTT", baseURI_) {
    _setDefaultRoyalty(paymentSplitPusher, royaltyValue);
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // ERC721 //

  /**
   * @dev 18+ confirm to enable minting.
   */
  function addMinter() public {
    _setupRole(MINTER_ROLE, _msgSender());
  }

  /**
   * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
   * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
   * by default, can be overriden in child contracts.
   */
  function _baseURI() internal view virtual override(ERC721, ERC721PresetMinterPauserAutoId) returns (string memory) {
    super._baseURI();
  }

  /**
   * @dev Hook that is called before any token transfer. This includes minting
   * and burning.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721PresetMinterPauserAutoId) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  /**
   * @dev Destroys `tokenId`.
   * The approval is cleared when the token is burned.
   */
  function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage, ERC721Royalty) {
    super._burn(tokenId);
  }

  /**
   * @dev Set proper token data for minting.
   */
  function _mint(address to, uint256 tokenId) internal virtual override(ERC721) {
    super._mint(to, tokenId);
    _setTokenURI(tokenId, _getButthole());
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721, ERC721Royalty, ERC721PresetMinterPauserAutoId)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  // ERC721URIStorage //

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // Buttholes //

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `newButthole` must not exist as a butthole.
   */
  function addButthole(address newButthole, string memory _tokenURI) public onlyOwner {
    require(!buttholeMap[newButthole], "Buttholes: account must not exist");
    buttholeOwners.push(newButthole);
    buttholeMap[newButthole] = true;
    buttholes[newButthole] = _tokenURI;
    emit PuckerUp(newButthole, _tokenURI);
  }

  /**
   * @dev Return a random uri.
   */
  function _getButthole() internal view returns (string memory) {
    return buttholes[buttholeOwners[uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, buttholeOwners))) % buttholeOwners.length]];
  }

}
