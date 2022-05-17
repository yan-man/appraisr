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

    // State Vars
    Organization[] public s_organizations;
    mapping(uint256 => AppraiserOrganization) public aoContracts;
    mapping(string => bool) private orgNames;
    mapping(address => bool) private orgAddresses;

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address aoContractAddress);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgAddr();
    error InvalidOrgId();

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
    {
        aoContracts[orgId_] = AppraiserOrganization(aoAddress_);
    }

    function mintReview(
        uint256 orgId_,
        uint256 rating_,
        string memory review_
    ) external isValidOrgId(orgId_) {
        AppraiserOrganization _ao = aoContracts[orgId_];
        uint256 _reviewId = _ao.mintReviewNFT(msg.sender, rating_, review_);
        console.log(_reviewId);
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
