// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title Fakito's Interactive Collection
/// @author @mateomolinari__
/// @notice A modified ERC1155 contract that allows to individually modify
/// tokenURIs to update metadata and upgrade with future modifying mechanisms

contract Fakito is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // Access control roles to allow ADMIN to upgrade contract logic without
    // having to access creator private key
    bytes32 public constant FAKITO = keccak256("FAKITO");
    bytes32 public constant ADMIN = keccak256("ADMIN");
    
    // Mapping from tokenIDs to pieces objects
    mapping(uint256 => Piece) internal pieces;

    // Token counter to prevent colliding ids
    uint256 private tokenCounter;

    // Struct to store dynamic token information
    struct Piece {
        string uri;
        bool isModifiable;
        bool ownerHasModified;
        uint256 lastModification;
        bytes4 mechanism;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _admin) public initializer {
        __ERC1155_init("Fakito's Interactives");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        // Granting FAKITO role to msg.sender
        _grantRole(FAKITO, msg.sender);
        _grantRole(ADMIN, _admin);
    }

    /// @notice Available only to FAKITO to mint new pieces
    /// @dev Internal functions of ERC1155Upgradeable have been modified
    /// @param tokenId Id for new piece. It is later checked to not collide with existing tokens
    /// @param amount Some pieces will be 1/1 while others multiple
    /// @param initialuri IPFS address to hosted metadata
    /// @param isModifiable Boolean defining if piece is going to be modified by users
    /// @param mechanism Modifiying mechanism to check on `modifyNFT`
    function mint(
        uint256 tokenId,
        uint256 amount,
        string memory initialuri,
        bool isModifiable,
        string memory mechanism
    ) public onlyRole(FAKITO) {
        require(tokenId == tokenCounter + 1, "token id not available");
        tokenCounter += 1;
        _mint(msg.sender, tokenId, amount, "");
        pieces[tokenId] = Piece(
            initialuri,
            isModifiable,
            false,
            0,
            bytes4(keccak256(bytes(mechanism)))
        );
    }

    /// @notice Burn existing pieces
    /// @dev Not intended for use. Just in case a migration is needed.
    /// @param from Address to be burned from
    /// @param id Id of token to be burned
    /// @param amount Amount to be burned in case is not a 1/1
    function emergencyBurn(
        address from,
        uint256 id,
        uint256 amount
    ) public onlyRole(FAKITO) {
        _burn(from, id, amount);
    }

    /// @notice Allows the owner of a token to modify its metadata once
    /// @dev Calls _updateURI on ERC1155Upgradeable. Modifying logic will be appended
    /// to the if/elseif chain
    /// @param tokenId Token to be modified
    /// @param newuri IPFS address to new metadata
    function modifyNFT(uint256 tokenId, string memory newuri) public {
        require(
            balanceOf(msg.sender, tokenId) >= 1,
            "not allowed to modify this nft"
        );
        Piece storage nft = pieces[tokenId];
        require(nft.isModifiable, "immutable token");
        
        // Only mechanism right now is oncePerOwner
        if (nft.mechanism == bytes4(keccak256(bytes("oncePerOwner")))) {
            require(!nft.ownerHasModified, "already modified");
            nft.ownerHasModified = true;
            nft.uri = newuri;
        } 
        // else if (nft.mechanism == yadayadayada) {
            
        // }
        // else if (nft.mechanism == yadayadayada) {

        // }

    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        Piece storage piece = pieces[tokenId];
        return piece.uri;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(ADMIN)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
