//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./OrganizationReviews.sol";

contract Appraiser is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public orgIds;

    // Structs
    struct Organization {
        uint256 orgId;
        string name;
        string symbol;
        address addr;
    }

    // State Vars
    Organization[] public s_organizations;
    mapping(uint256 => address) public orgReviewsContracts;
    mapping(string => bool) private orgNames;
    mapping(string => bool) private orgSymbols;
    mapping(address => bool) private orgAddresses;

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address orgReviewsContract);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgSymbol();
    error DuplicateOrgAddr();

    // Modifiers
    modifier uniqueOrg(
        string memory name_,
        string memory symbol_,
        address addr_
    ) {
        if (orgNames[name_]) {
            revert DuplicateOrgName();
        }
        if (orgSymbols[symbol_]) {
            revert DuplicateOrgSymbol();
        }
        if (orgAddresses[addr_]) {
            revert DuplicateOrgAddr();
        }
        _;
    }

    constructor() {}

    function addOrganization(
        string memory name_,
        string memory symbol_,
        address addr_
    ) public uniqueOrg(name_, symbol_, addr_) {
        uint orgId = orgIds.current();
        Organization memory newOrg = Organization({
            orgId: orgId,
            name: name_,
            symbol: symbol_,
            addr: addr_
        });
        s_organizations.push(newOrg);
        orgNames[name_] = true;
        orgSymbols[symbol_] = true;
        orgAddresses[addr_] = true;
        orgIds.increment();

        deployOrgReviewsNFTContract(newOrg);

        emit LogAddOrganization(orgId);
    }

    function deployOrgReviewsNFTContract(Organization memory org) internal {
        OrganizationReviews orgReview = new OrganizationReviews(
            string(abi.encodePacked("appraiser-", org.name)),
            string(abi.encodePacked("APRSR-", org.symbol))
        );
        address orgReviewAddress = address(orgReview);
        orgReviewsContracts[org.orgId] = orgReviewAddress;

        emit LogNFTContractDeployed(orgReviewAddress);
    }

    function currentOrgId() public view returns (uint256) {
        return orgIds.current();
    }

    function numberOrganizations() public view returns (uint256) {
        return s_organizations.length;
    }
}
