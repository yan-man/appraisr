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
    }

    // State Vars
    Organization[] public s_organizations;
    mapping(uint256 => address) public aoContracts;
    mapping(string => bool) private orgNames;
    mapping(address => bool) private orgAddresses;

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address aoContractAddress);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgAddr();

    // Modifiers
    modifier uniqueOrg(string memory name_, address addr_) {
        if (orgNames[name_]) {
            revert DuplicateOrgName();
        }
        if (orgAddresses[addr_]) {
            revert DuplicateOrgAddr();
        }
        _;
    }

    constructor() {}

    function addOrganization(string memory name_, address addr_)
        public
        uniqueOrg(name_, addr_)
    {
        uint orgId = orgIds.current();
        Organization memory newOrg = Organization({
            orgId: orgId,
            name: name_,
            addr: addr_
        });
        s_organizations.push(newOrg);
        orgNames[name_] = true;
        orgAddresses[addr_] = true;
        orgIds.increment();

        deployNFTContract(newOrg);

        emit LogAddOrganization(orgId);
    }

    function deployNFTContract(Organization memory org) internal {
        AppraiserOrganization ao = new AppraiserOrganization("URI");
        address aoAddress = address(ao);
        aoContracts[org.orgId] = aoAddress;

        emit LogNFTContractDeployed(aoAddress);
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
