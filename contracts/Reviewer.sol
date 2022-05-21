//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Reviews.sol";
import "./AppraiserOrganization.sol";
import "./Users.sol";

contract Reviewer is Ownable {
    using Counters for Counters.Counter;
    using Reviews for Reviews.Review;
    using Users for Users.User;

    // state vars
    mapping(uint256 => Reviews.Review) public s_verifiers; // orgId -> # of tokens
    mapping(uint256 => address) public s_aoContracts; // orgId -> deployed AO contract
    mapping(uint256 => mapping(uint256 => address)) public s_reviews; // orgId -> reviewId -> reviewer address
    mapping(address => Users.User) public s_users; // user/reviewer address -> User struct

    // events
    event LogMintReview(uint256 reviewId);
    event LogNewUser(address addr);
    event LogVoteOnReview(address voter, uint256 orgId, uint256 reviewId);

    // errors
    error Appraiser__InvalidOrgId();
    error Appraiser__VoterMatchesAuthor();
    error Appraiser__InvalidReview();

    // modifiers
    modifier isValidOrgId(uint256 orgId_) {
        _isValidOrgId(orgId_);
        _;
    }

    function _isValidOrgId(uint256 orgId_) private view {
        if (address(s_aoContracts[orgId_]) == address(0)) {
            revert Appraiser__InvalidOrgId();
        }
    }

    constructor() {}

    function addUser(address addr_) private {
        if (s_users[addr_].isRegistered == false) {
            s_users[addr_] = Users.User({
                upvotes: 0,
                downvotes: 0,
                isRegistered: true
            });

            emit LogNewUser(addr_);
        }
    }

    function mintReview(
        uint256 orgId_,
        uint256 rating_,
        string calldata review_
    ) external isValidOrgId(orgId_) {
        uint256 _reviewId = AppraiserOrganization(s_aoContracts[orgId_])
            .mintReviewNFT(msg.sender, rating_, review_);
        s_reviews[orgId_][_reviewId] = msg.sender;
        addUser(msg.sender);
        emit LogMintReview(_reviewId);
    }

    function setAppraiserOrganizationContractAddress(
        uint256 orgId_,
        address contractAddr_
    ) external {
        s_aoContracts[orgId_] = contractAddr_;
    }

    function voteOnReview(
        uint256 orgId_,
        uint256 reviewId_,
        bool isUpvote_
    ) external isValidOrgId(orgId_) {
        address _reviewAuthorAddr = s_reviews[orgId_][reviewId_];
        if (_reviewAuthorAddr == address(0)) {
            revert Appraiser__InvalidReview();
        }
        if (msg.sender == _reviewAuthorAddr) {
            revert Appraiser__VoterMatchesAuthor();
        }

        Users.User storage _reviewUser = s_users[s_reviews[orgId_][reviewId_]];
        if (isUpvote_ == true) {
            _reviewUser.upvotes += 1;
        } else {
            _reviewUser.downvotes += 1;
        }
        AppraiserOrganization(s_aoContracts[orgId_]).voteOnReview(
            msg.sender,
            reviewId_,
            isUpvote_
        );

        emit LogVoteOnReview(msg.sender, orgId_, reviewId_);
    }
}
