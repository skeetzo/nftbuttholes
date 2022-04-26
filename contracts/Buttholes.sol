// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
//
import "./PaymentSplitPusher.sol";


/**
 * @title Buttholes
 * @author Skeetzo
 * @dev Stupid (non-Solana) butthole nfts.
 */
contract Buttholes is Ownable, ERC721URIStorage, ERC721Royalty, ERC721PresetMinterPauserAutoId {

  event PuckerUp(address addedButthole, string buttholeHash);

  // Ukraine Government
  address public constant DONOR1 = address(0x165CD37b4C644C2921454429E7F9358d18A45e14);
  // Action Against Hunger USA
  address public constant DONOR2 = address(0xC7c3A15b7e5C1f121fE09064f6eCe9aBF87Bbd8c);
  // International Medical Corps
  address public constant DONOR3 = address(0x5F08845e53Ba171B7a782D0CdEA96Ab720426260);

  // butthole hashes
  mapping(address => string) public buttholes;
  // account quick mapping
  mapping(address => bool) public buttholeMap;
  // unique butthole owners
  address[] buttholeOwners;
  // paymentsplitters
  mapping(address => address) paymentSplitPushers;
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
    // get random owner of a butthole
    address buttholeOwner = _getButthole();
    // set token uri to be butthole uri of random owner
    _setTokenURI(tokenId, buttholes[buttholeOwner]);
    // set royalty for token id and butthole owner's splitter contract
    _setTokenRoyalty(tokenId, paymentSplitPushers[buttholeOwner], royaltyValue);
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
    buttholeMap[newButthole] = true;
    buttholeOwners.push(newButthole);
    buttholes[newButthole] = _tokenURI;
    paymentSplitPushers[newButthole] = _createPaymentSplitPusher(newButthole);
    emit PuckerUp(newButthole, _tokenURI);
  }

  /**
   * @dev Return a random uri.
   */
  function _getButthole() internal view returns (address) {
    return buttholeOwners[uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, buttholeOwners))) % buttholeOwners.length];
  }

  function _createPaymentSplitPusher(address newButthole) internal returns (address) {
    address[] memory payees = new address[](4);
    payees[0] = newButthole;
    payees[1] = DONOR1;
    payees[2] = DONOR2;
    payees[3] = DONOR3;
    uint256[] memory shares = new uint256[](4);
    shares[0] = 91;
    shares[1] = 3;
    shares[2] = 3;
    shares[3] = 3;
    PaymentSplitPusher p = new PaymentSplitPusher(payees, shares);
    return address(p);
  }

}
