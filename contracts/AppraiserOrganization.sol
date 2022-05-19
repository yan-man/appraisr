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
        bool isVerified;
    }

    // state vars
    uint256 orgId;
    mapping(uint256 => Review) public s_reviews; // reviewId -> Review
    mapping(uint256 => address[]) s_upvotes; // reviewId -> [voting addresses]
    mapping(uint256 => address[]) s_downvotes; // reviewId -> [voting addresses]

    Counters.Counter private _reviewIds;
    Organizations.Organization private s_organization;
    address private s_verifierContractAddress;
    uint256 private VERIFIER_ID;

    // events
    event LogNFTReviewMinted(uint256 reviewId);
    event LogNFTReviewVote(uint256 reviewId);

    // errors
    error InvalidRating();
    error OnlyOwnerCanTransferVerifierNFT();

    // modifiers
    modifier isValidRating(uint256 rating_) {
        // console.log(rating_);
        if (rating_ == 0 || rating_ > 100) {
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
        s_verifierContractAddress = verifierAddr_;
        VERIFIER_ID = Verifier(s_verifierContractAddress).VERIFIER();
        _reviewIds.increment();
    }

    function mintReviewNFT(
        address reviewerAddr_,
        uint256 rating_,
        string memory review_
    ) public isValidRating(rating_) returns (uint256) {
        uint256 _reviewId = _reviewIds.current();
        _mint(reviewerAddr_, _reviewId, 1, "");

        bool _isVerified = false;
        Verifier _verifier = Verifier(s_verifierContractAddress);
        if (_verifier.balanceOf(reviewerAddr_, VERIFIER_ID) > 0) {
            _verifier.burnVerifierForAddress(reviewerAddr_);
            _isVerified = true;
        }

        Review memory review = Review({
            author: reviewerAddr_,
            rating: rating_,
            review: review_,
            unixtime: block.timestamp,
            isVerified: _isVerified
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
        } else {
            s_downvotes[reviewId_].push(reviewer_);
        }
        emit LogNFTReviewVote(reviewId_);
    }

    // function getNumVotes(uint256 reviewId_, bool isUpvote_)
    //     external
    //     returns (uint256)
    // {
    //     if (isUpvote_ == true) {
    //         return s_upvotes[reviewId_].length;
    //     } else {
    //         return s_downvotes[reviewId_].length;
    //     }
    // }

    function currentReviewId() external view returns (uint256) {
        return _reviewIds.current();
    }
}
