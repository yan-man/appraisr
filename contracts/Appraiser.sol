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
        string companyName;
        address businessAddress;
    }

    // State Vars

    Organization[] public s_organizations;

    // Events
    event LogAddOrg(uint256 orgId);

    // Errors

    // Modifiers
    constructor() {}

    function addOrganization(
        string calldata companyName_,
        address businessAddress_
    ) public {
        uint orgId = orgIds.current();
        Organization memory newOrg = Organization({
            orgId: orgId,
            companyName: companyName_,
            businessAddress: businessAddress_
        });
        s_organizations.push(newOrg);
        orgIds.increment();

        emit LogAddOrg(orgId);
    }

    function currentOrgId() public view returns (uint256) {
        return orgIds.current();
    }

    function numberOrganizations() public view returns (uint256) {
        return s_organizations.length;
    }
}
