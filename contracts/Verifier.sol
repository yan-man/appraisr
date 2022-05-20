//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Reviews.sol";

import "hardhat/console.sol";

contract Verifier is ERC1155, Ownable, AccessControl {
    using Counters for Counters.Counter;
    using Reviews for Reviews.Review;

    // state vars
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public constant VERIFIER = 0;

    uint256 public s_orgId;
    string public s_name;
    mapping(uint256 => Reviews.Review) public s_verifiers; // orgId -> # of tokens
    address public s_appraiserContract;

    // events

    // errors
    error OnlyAdminCanTransferVerifierNFT();
    error InvalidBurnerAddress();
    error ERC1155__NotOwnerNorApproved();

    // modifiers
    constructor(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_,
        address owner_
    ) ERC1155(URI_) {
        transferOwnership(owner_);

        s_orgId = orgId_;
        s_name = name_;

        _mint(addr_, VERIFIER, 10**3, "");
        _setupRole(ADMIN_ROLE, addr_);
        s_appraiserContract = _msgSender();
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        if (
            (from == _msgSender() || isApprovedForAll(from, _msgSender())) ==
            false
        ) {
            revert ERC1155__NotOwnerNorApproved();
        }
        if (
            hasRole(ADMIN_ROLE, msg.sender) == false && _msgSender() != owner()
        ) {
            revert OnlyAdminCanTransferVerifierNFT();
        }
        _safeTransferFrom(from, to, id, amount, data);
    }

    function mintBatch(
        uint256[] memory ids_,
        uint256[] memory amounts_,
        address to_
    ) external onlyOwner {
        _mintBatch(to_, ids_, amounts_, "");
    }

    function setAppraiserContractAddress(address appraiserContractAddress_)
        external
        onlyOwner
    {
        s_appraiserContract = appraiserContractAddress_;
    }

    function burnVerifierForAddress(address burnTokenAddress) external {
        if (_msgSender() != s_appraiserContract) {
            revert InvalidBurnerAddress();
        }
        _burn(burnTokenAddress, VERIFIER, 1);
    }

    function isAdmin(address addr) external view returns (bool) {
        return hasRole(keccak256("ADMIN_ROLE"), addr);
    }

    // MUST be implemented to override from ERC1155 / AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
