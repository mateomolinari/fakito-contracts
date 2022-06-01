// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// THIS IS CONTRACT IS INTENDED FOR UPGRADE TESTING ONLY 

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract Fakito2 is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant FAKITO = keccak256("FAKITO");
    CountersUpgradeable.Counter private _tokenIdCounter;
    bytes32 public constant ADMIN = keccak256("ADMIN");
    mapping(uint256 => Piece) internal pieces;

    struct Piece {
        bool modifiable;
        bool ownerHasModified;
        bytes4 modifyingMechanism;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _fakito) public initializer {
        __ERC721_init("Fakito", "FKT");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(FAKITO, _fakito);
        _grantRole(ADMIN, msg.sender);
    }

    function safeMint(string memory uri, string memory mechanism, bool isModifiable) public onlyRole(FAKITO) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        pieces[tokenId] = Piece(
            isModifiable,
            false,
            bytes4(keccak256(abi.encodePacked(mechanism)))
        );
    }

    function modifyNFT(uint256 id, string memory newuri) public {
        require(ownerOf(id) == msg.sender, "not owner");
        Piece storage piece = pieces[id];
        require(piece.modifiable, "immutable token");
        if (piece.modifyingMechanism == bytes4(keccak256(abi.encodePacked("OncePerOwner")))) {
            require(!piece.ownerHasModified, "already modified");
            piece.ownerHasModified = true;
            _setTokenURI(id, newuri);
        } else if (piece.modifyingMechanism == bytes4(keccak256(abi.encodePacked("RotatingModifier")))) {
            // testing upgradeability
            _setTokenURI(id, newuri);
        }
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(ADMIN)
        override
    {}

    function emergencyBurn(uint256[] memory tokenIds) public onlyRole(FAKITO) {
        uint256 length = tokenIds.length;
        for (uint i; i < length;) {
            _burn(tokenIds[i]);
            unchecked {
                { ++i; }
            }
        }
    }

    function _afterTokenTransfer(
        address,
        address,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable) {
        Piece storage piece = pieces[tokenId];
        piece.ownerHasModified = false;
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}