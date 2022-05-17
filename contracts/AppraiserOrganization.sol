//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// rename OrganizationReviews to AppraiserOrganization
contract AppraiserOrganization is ERC1155, Ownable {
    using Counters for Counters.Counter;

    struct Review {
        uint256 rating;
        string review;
    }

    uint256 public constant VERIFIER = 0;
    Counters.Counter private _reviewIds;

    constructor(string memory URI_) ERC1155(URI_) {
        // _mint(msg.sender, VERIFIER, 10**3, "");
        _reviewIds.increment();
    }

    function mintReview(
        address player_,
        uint256 rating_,
        string memory review_
    ) public {
        uint256 _reviewId = _reviewIds.current();
        // _mint(player_, _reviewId, 1, "");
    }
}
