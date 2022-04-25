// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Buttholes
 * @author Skeetzo
 * @dev Stupid (non-Solana) butthole nfts.
 */
contract Buttholes is Ownable, ERC721URIStorage, ERC721Royalty, ERC721PresetMinterPauserAutoId {

  // public image uri
  string public buttholeFlap;

  // index of uris -??? i think i need to update this when i update whos allowed to upload their butthole
  mapping(address => string) public buttholes;

  // unique butthole owners
  address[] buttholeOwners;

  // number of butthole pics
  uint256 public buttholesCount;

  // royalty fee - 2%
  uint96 public constant royaltyValue = 200;

  address payable PaymentSplitPusher;

  /**
   * @dev Contract constructor. Sets metadata extension `name` and `symbol`.
   */
  constructor(string memory butthole, string memory buttflap, string memory baseURI_, address payable paymentSplitPusher) ERC721PresetMinterPauserAutoId("Butthole", "BUTT", baseURI_) {
    buttholeFlap = buttflap;
    buttholeOwners.push(_msgSender());
    buttholes[_msgSender()] = butthole;
    buttholesCount += 1;
    _setDefaultRoyalty(PaymentSplitPusher, royaltyValue);
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // ERC721 //

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
    address _buttholeOwner = _getButtholeOwner();
    string memory _butthole = buttholes[_buttholeOwner];
    // _setTokenRoyalty(tokenId, _buttholeOwner, royaltyValue);
    _setTokenURI(tokenId, _butthole);
    super._mint(to, tokenId);
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
   * - `newButthole` must not exist.
   */
  function addButthole(address newButthole, string memory _tokenURI) public onlyOwner {
    // butthole owner must not already exist
    require(!_existingButthole(newButthole), "Buttholes: URI add of preexisting account");
    buttholes[newButthole] = _tokenURI;
    buttholesCount+=1;
    buttholeOwners.push(newButthole);
  }

  function _existingButthole(address butthole) internal view virtual returns (bool) {
    // https://ethereum.stackexchange.com/questions/11039/how-can-you-check-if-a-string-is-empty-in-solidity
    // convert the string into a type bytes and then check its length
    bytes memory tempEmptyStringTest = bytes(buttholes[butthole]); // Uses memory
    if (tempEmptyStringTest.length == 0) {
      // emptyStringTest is an empty string
      return false;
    } else {
      // emptyStringTest is not an empty string
      return true;
    }
  }

  /**
   * @dev Return a random uri.
   */
  function _getButtholeOwner() internal returns (address) {
    return buttholeOwners[uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, buttholeOwners))) % buttholesCount];
  }

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function setButtholeURI(string memory _tokenURI) public {
    require(_existingButthole(_msgSender()), "Buttholes: URI set of nonexistent account");
    buttholes[_msgSender()] = _tokenURI;
  }

  /**
   * @dev Feel special.
   */
  function VIP() public returns (uint) {
    return 0;
  }

}
