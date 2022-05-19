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
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // state vars
    uint256 orgId;
    uint256 public constant VERIFIER = 0;
    mapping(uint256 => Reviews.Review) public s_verifiers; // orgId -> # of tokens

    address private s_appraiserContract;

    // events

    // errors
    error OnlyAdminCanTransferVerifierNFT();

    // modifiers
    constructor(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_
    ) ERC1155(URI_) {
        orgId = orgId_;
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
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        if (
            hasRole(ADMIN_ROLE, msg.sender) == false && _msgSender() != owner()
        ) {
            revert OnlyAdminCanTransferVerifierNFT();
        }
        _safeTransferFrom(from, to, id, amount, data);
    }

    function setAppraiserContractAddress(address appraiserContractAddress_)
        external
        onlyOwner
    {
        s_appraiserContract = appraiserContractAddress_;
    }

    function burnVerifierForAddress(address burnTokenAddress) external {
        require(_msgSender() == s_appraiserContract, "Invalid burner address");
        _burn(burnTokenAddress, VERIFIER, 1);
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