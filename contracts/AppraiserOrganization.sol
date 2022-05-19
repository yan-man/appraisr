//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Verifier.sol";
import "./Organizations.sol";

contract AppraiserOrganization is ERC1155, Ownable {
    using Counters for Counters.Counter;
    using Organizations for Organizations.Organization;

    // structs
    struct Review {
        address author;
        uint256 rating;
        string review;
        uint256 unixtime;
    }

    // state vars
    uint256 orgId;
    mapping(uint256 => Review) public s_reviews; // reviewId -> Review
    mapping(uint256 => address[]) s_upvotes; // reviewId -> [voting addresses]
    mapping(uint256 => address[]) s_downvotes; // reviewId -> [voting addresses]

    Counters.Counter private _reviewIds;
    Organizations.Organization private s_organization;
    Verifier private immutable s_verifier;

    // events
    event LogNFTReviewMinted(uint256 reviewId);

    // errors
    error InvalidRating();
    error OnlyOwnerCanTransferVerifierNFT();

    // modifiers
    modifier isValidRating(uint256 rating_) {
        if (rating_ <= 0 || rating_ > 100) {
            revert InvalidRating();
        }
        _;
    }

    constructor(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_,
        address verifierAddr_
    ) ERC1155(URI_) {
        Organizations.Organization memory _org = Organizations.Organization({
            orgId: orgId_,
            name: name_,
            addr: addr_,
            isActive: true,
            isCreated: true
        });
        s_organization = _org;
        s_verifier = Verifier(verifierAddr_);

        _reviewIds.increment();
    }

    function mintReviewNFT(
        address reviewerAddr_,
        uint256 rating_,
        string memory review_
    ) public isValidRating(rating_) returns (uint256) {
        uint256 _reviewId = _reviewIds.current();
        _mint(reviewerAddr_, _reviewId, 1, "");

        // if (_verifier.balanceOf(reviewerAddr_, VERIFIER) > 0) {
        //     console.log("verified");
        // }

        Review memory review = Review({
            author: reviewerAddr_,
            rating: rating_,
            review: review_,
            unixtime: block.timestamp
        });
        s_reviews[_reviewId] = review;
        _reviewIds.increment();

        emit LogNFTReviewMinted(_reviewId);
        return _reviewId;
    }

    function voteOnReview(
        address reviewer_,
        uint256 reviewId_,
        bool isUpvote_
    ) external returns (uint256) {
        uint256 _length;
        if (isUpvote_ == true) {
            s_upvotes[reviewId_].push(reviewer_);
            _length = s_upvotes[reviewId_].length;
        } else {
            s_downvotes[reviewId_].push(reviewer_);
            _length = s_downvotes[reviewId_].length;
        }
        return _length;
    }

    function currentReviewId() external view returns (uint256) {
        return _reviewIds.current();
    }
}
