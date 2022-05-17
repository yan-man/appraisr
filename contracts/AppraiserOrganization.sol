//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// rename OrganizationReviews to AppraiserOrganization
contract AppraiserOrganization is ERC1155, Ownable {
    using Counters for Counters.Counter;

    // structs
    struct Review {
        uint256 rating;
        string review;
    }

    // state vars
    uint256 public constant VERIFIER = 0;
    mapping(uint256 => Review) reviews;

    Counters.Counter private _reviewIds;

    // events

    // errors
    error InvalidRating();

    // modifiers
    modifier isValidRating(uint256 rating_) {
        if (rating_ <= 0 || rating_ > 100) {
            revert InvalidRating();
        }
        _;
    }

    constructor(string memory URI_) ERC1155(URI_) {
        _mint(msg.sender, VERIFIER, 10**3, "");
        _reviewIds.increment();
    }

    function mintReviewNFT(
        address player_,
        uint256 rating_,
        string memory review_
    ) public isValidRating(rating_) returns (uint256) {
        // save into review state var too
        // emit NFT
        uint256 _reviewId = _reviewIds.current();
        _mint(player_, _reviewId, 1, "");

        Review memory review = Review({rating: rating_, review: review_});
        reviews[_reviewId] = review;

        _reviewIds.increment();
        return _reviewId;
    }
}
