//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Reviews.sol";

import "hardhat/console.sol";

contract Verifier is ERC1155, Ownable {
    using Counters for Counters.Counter;
    using Reviews for Reviews.Review;

    // state vars
    uint256 orgId;
    uint256 public constant VERIFIER = 0;
    mapping(uint256 => Reviews.Review) public s_verifiers; // orgId -> # of tokens

    Counters.Counter private _reviewIds;

    // events

    // errors
    error OnlyOwnerCanTransferVerifierNFT();

    // modifiers
    constructor(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_
    ) ERC1155(URI_) {
        orgId = orgId_;
        _mint(addr_, VERIFIER, 10**3, "");
        _reviewIds.increment();
        // setApprovalForAll(address(this), true);
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
        if (owner() != from && id == VERIFIER) {
            revert OnlyOwnerCanTransferVerifierNFT();
        }
        _safeTransferFrom(from, to, id, amount, data);
    }
}
