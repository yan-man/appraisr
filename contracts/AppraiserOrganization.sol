//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Verifier.sol";

contract AppraiserOrganization is ERC1155, Ownable {
    using Counters for Counters.Counter;

    // structs
    struct Review {
        address author;
        uint256 rating;
        string review;
        uint256 unixtime;
    }

    // state vars
    uint256 orgId;
    mapping(uint256 => Verifier) public s_vContracts; // orgId -> deployed AO contract
    mapping(uint256 => Review) public s_reviews; // reviewId -> Review
    mapping(uint256 => address[]) s_upvotes; // reviewId -> [voting addresses]
    mapping(uint256 => address[]) s_downvotes; // reviewId -> [voting addresses]

    Counters.Counter private _reviewIds;

    // events
    event LogNFTReviewMinted(uint256 reviewId);
    event LogVerifierNFTContractDeployed(address verifierContractAddress);

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

    constructor(uint256 orgId_, string memory URI_) ERC1155(URI_) {
        orgId = orgId_;
        deployVerifierNFTContract(orgId, URI_);
    }

    function deployVerifierNFTContract(uint256 _orgId, string memory URI_)
        internal
    {
        Verifier _verifier = new Verifier(_orgId, URI_);
        s_vContracts[_orgId] = _verifier;

        emit LogVerifierNFTContractDeployed(address(_verifier));
    }

    function mintReviewNFT(
        address reviewerAddr_,
        uint256 rating_,
        string memory review_
    ) public isValidRating(rating_) returns (uint256) {
        uint256 _reviewId = _reviewIds.current();
        _mint(reviewerAddr_, _reviewId, 1, "");

        // if (balanceOf(reviewerAddr_, VERIFIER) > 0) {
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
