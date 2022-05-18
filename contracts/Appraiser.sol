//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AppraiserOrganization.sol";

contract Appraiser is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public orgIds;

    // Structs
    struct Organization {
        uint256 orgId;
        string name;
        address addr;
        bool isActive;
        bool isCreated;
    }

    struct User {
        uint256 reputation;
        bool isRegistered;
    }

    struct Review {
        uint256 rating;
        string review;
        uint256 upvotes;
        uint256 downvotes;
    }

    // State Vars
    Organization[] public s_organizations;
    mapping(uint256 => AppraiserOrganization) public aoContracts;
    mapping(string => bool) private orgNames;
    mapping(address => bool) private orgAddresses;
    mapping(uint256 => mapping(uint256 => address)) public s_reviews; // orgId -> reviewId -> reviewer address
    mapping(address => User) public users;

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address aoContractAddress);
    event LogMintReview(uint256 reviewId);
    event LogNewUser(address addr);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgAddr();
    error InvalidOrgId();
    error UserExists();

    // Modifiers
    modifier isUniqueOrg(string memory name_, address addr_) {
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

    modifier isNewUser(address addr_) {
        if (users[addr_].isRegistered == true) {
            revert UserExists();
        }
        _;
    }

    constructor() {}

    function addOrganization(string memory name_, address addr_)
        public
        isUniqueOrg(name_, addr_)
    {
        uint orgId = orgIds.current();
        Organization memory newOrg = Organization({
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

        deployNFTContract(newOrg);
        emit LogAddOrganization(orgId);
    }

    function deployNFTContract(Organization memory org) internal {
        AppraiserOrganization _ao = new AppraiserOrganization("URI");
        aoContracts[org.orgId] = _ao;

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
        string memory review_
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

    function addUser(address addr_) private isNewUser(addr_) {
        User memory newUser = User({reputation: 0, isRegistered: true});
        users[addr_] = newUser;
        emit LogNewUser(addr_);
    }

    function rateReview(
        uint256 orgId_,
        uint256 reviewId_,
        bool isUpvote_
    ) external {
        // update AO: update review rating
        // update user's reputation
        User memory _reviewUser = users[s_reviews[orgId_][reviewId_]];
        if (isUpvote_ == true) {
            _reviewUser.reputation += 1;
        } else {
            _reviewUser.reputation -= 1;
        }
        users[s_reviews[orgId_][reviewId_]].reputation = _reviewUser.reputation;
        aoContracts[orgId_].rateReview(msg.sender, reviewId_, isUpvote_);
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
