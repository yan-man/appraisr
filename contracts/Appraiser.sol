//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AppraiserOrganization.sol";
import "./Organizations.sol";
import "./Users.sol";
import "./Reviews.sol";

contract Appraiser is Ownable {
    using Counters for Counters.Counter;
    using Organizations for Organizations.Organization;
    using Users for Users.User;
    using Reviews for Reviews.Review;
    Counters.Counter public orgIds;

    // Structs

    // State Vars
    Organizations.Organization[] public s_organizations;
    mapping(uint256 => AppraiserOrganization) public aoContracts; // orgId -> deployed AO contract
    mapping(string => bool) private orgNames; // org name -> is active flag
    mapping(address => bool) private orgAddresses; // org address -> is active flag
    mapping(uint256 => mapping(uint256 => address)) public s_reviews; // orgId -> reviewId -> reviewer address
    mapping(address => Users.User) public users; // user/reviewer address -> User struct

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address aoContractAddress);
    event LogMintReview(uint256 reviewId);
    event LogNewUser(address addr);
    event LogVoteOnReview(address voter, uint256 orgId, uint256 reviewId);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgAddr();
    error InvalidOrgId();
    error UserExists();
    error ReviewerMatchesAuthor();
    error InvalidReview();

    // Modifiers
    modifier isUniqueOrg(string calldata name_, address addr_) {
        if (orgNames[name_]) {
            revert DuplicateOrgName();
        }
        if (orgAddresses[addr_]) {
            revert DuplicateOrgAddr();
        }
        _;
    }

    modifier isValidOrgId(uint256 orgId_) {
        if (address(aoContracts[orgId_]) == address(0)) {
            revert InvalidOrgId();
        }
        _;
    }

    modifier isReviewerValid(uint256 orgId_, uint256 reviewId_) {
        address _reviewAuthorAddr = s_reviews[orgId_][reviewId_];
        if (_reviewAuthorAddr == address(0)) {
            revert InvalidReview();
        }
        if (msg.sender == _reviewAuthorAddr) {
            revert ReviewerMatchesAuthor();
        }
        _;
    }

    constructor() {}

    function addOrganization(
        string calldata name_,
        address addr_,
        string calldata URI_
    ) public isUniqueOrg(name_, addr_) onlyOwner {
        uint orgId = orgIds.current();
        Organizations.Organization memory newOrg = Organizations.Organization({
            orgId: orgId,
            name: name_,
            addr: addr_,
            isActive: true,
            isCreated: true
        });
        s_organizations.push(newOrg);
        orgNames[name_] = true;
        orgAddresses[addr_] = true;
        orgIds.increment();

        deployNFTContract(orgId, name_, addr_, URI_);
        emit LogAddOrganization(orgId);
    }

    function deployNFTContract(
        uint256 orgId_,
        string calldata name_,
        address addr_,
        string calldata URI_
    ) internal {
        AppraiserOrganization _ao = new AppraiserOrganization(
            orgId_,
            name_,
            addr_,
            URI_
        );
        aoContracts[orgId_] = _ao;

        emit LogNFTContractDeployed(address(_ao));
    }

    function setAOContractAddress(uint256 orgId_, address aoAddress_)
        public
        onlyOwner
        isValidOrgId(orgId_)
    {
        aoContracts[orgId_] = AppraiserOrganization(aoAddress_);
    }

    function mintReview(
        uint256 orgId_,
        uint256 rating_,
        string calldata review_
    ) external isValidOrgId(orgId_) {
        uint256 _reviewId = aoContracts[orgId_].mintReviewNFT(
            msg.sender,
            rating_,
            review_
        );
        s_reviews[orgId_][_reviewId] = msg.sender;
        addUser(msg.sender);
        emit LogMintReview(_reviewId);
    }

    function addUser(address addr_) private {
        if (users[addr_].isRegistered == false) {
            users[addr_] = Users.User({
                upvotes: 0,
                downvotes: 0,
                isRegistered: true
            });

            emit LogNewUser(addr_);
        }
    }

    function voteOnReview(
        uint256 orgId_,
        uint256 reviewId_,
        bool isUpvote_
    ) external isValidOrgId(orgId_) isReviewerValid(orgId_, reviewId_) {
        Users.User storage _reviewUser = users[s_reviews[orgId_][reviewId_]];
        if (isUpvote_ == true) {
            _reviewUser.upvotes += 1;
        } else {
            _reviewUser.downvotes += 1;
        }
        aoContracts[orgId_].voteOnReview(msg.sender, reviewId_, isUpvote_);

        emit LogVoteOnReview(msg.sender, orgId_, reviewId_);
    }

    function currentOrgId() public view returns (uint256) {
        return orgIds.current();
    }

    function numberOrganizations() public view returns (uint256) {
        return s_organizations.length;
    }

    // implement these functions to allow this contract to accept 1155 tokens
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
