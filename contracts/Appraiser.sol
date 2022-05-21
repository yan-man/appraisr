//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AppraiserOrganization.sol";
import "./Verifier.sol";
import "./Users.sol"; // to use struct
import "./Reviewer.sol"; // to use struct

contract Appraiser is Ownable {
    using Counters for Counters.Counter;

    // State Vars
    Counters.Counter public s_orgIds;
    mapping(uint256 => uint256) public s_organizations; // orgId -> intbool isActive
    mapping(uint256 => address) public s_vContracts; // orgId -> deployed Verifier contract
    mapping(string => uint256) private s_orgNames; // org name -> intbool exists flag
    address private s_reviewerContract;
    mapping(uint256 => mapping(uint256 => address)) public s_reviews; // orgId -> reviewId -> reviewer address

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogVerifierNFTContractDeployed(address verifierContractAddress);

    // Errors
    error Appraiser__DuplicateOrgName();

    // Modifiers

    constructor(address reviewerContract_) {
        s_reviewerContract = reviewerContract_;
    }

    function addOrganization(
        string calldata name_,
        address addr_,
        string calldata URI_
    ) public onlyOwner {
        if (s_orgNames[name_] == 1) {
            revert Appraiser__DuplicateOrgName();
        }

        uint _orgId = s_orgIds.current();
        s_organizations[_orgId] = 1;
        s_orgNames[name_] = 1;
        s_orgIds.increment();

        address _verifierAddr = deployVerifierNFTContract(
            _orgId,
            name_,
            addr_,
            URI_
        );
        address _aoContract = deployAppraiserOrganizationNFTContract(
            _orgId,
            name_,
            addr_,
            URI_,
            _verifierAddr
        );
        Reviewer(s_reviewerContract).setApprovalOrganizationContractAddress(
            _orgId,
            address(_aoContract)
        );
        emit LogAddOrganization(_orgId);
    }

    function deployVerifierNFTContract(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_
    ) internal returns (address) {
        Verifier _verifier = new Verifier(orgId_, name_, addr_, URI_, owner());
        s_vContracts[orgId_] = address(_verifier);

        emit LogVerifierNFTContractDeployed(address(_verifier));
        return address(_verifier);
    }

    function deployAppraiserOrganizationNFTContract(
        uint256 orgId_,
        string calldata name_,
        address addr_,
        string calldata URI_,
        address verifierAddr_
    ) internal returns (address) {
        AppraiserOrganization _ao = new AppraiserOrganization(
            orgId_,
            name_,
            addr_,
            URI_,
            verifierAddr_
        );
        return address(_ao);
    }

    function numberOrganizations() external view returns (uint256) {
        return s_orgIds.current();
    }
}
