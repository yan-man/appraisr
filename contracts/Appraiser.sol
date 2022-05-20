//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AppraiserOrganization.sol";
import "./Organizations.sol"; // to use struct
import "./Users.sol"; // to use struct

contract Appraiser is Ownable {
    using Counters for Counters.Counter;
    using Organizations for Organizations.Organization;
    using Users for Users.User;

    // State Vars
    Counters.Counter public orgIds;
    Organizations.Organization[] public s_organizations;
    mapping(uint256 => address) public s_vContracts; // orgId -> deployed Verifier contract
    mapping(uint256 => address) public s_aoContracts; // orgId -> deployed AO contract
    mapping(string => bool) private s_orgNames; // org name -> is active flag
    mapping(address => bool) private s_orgAddresses; // org address -> is active flag
    mapping(uint256 => mapping(uint256 => address)) public s_reviews; // orgId -> reviewId -> reviewer address
    mapping(address => Users.User) public s_users; // user/reviewer address -> User struct

    // Events
    event LogAddOrganization(uint256 orgId);
    event LogNFTContractDeployed(address aoContractAddress);
    event LogMintReview(uint256 reviewId);
    event LogNewUser(address addr);
    event LogVoteOnReview(address voter, uint256 orgId, uint256 reviewId);
    event LogVerifierNFTContractDeployed(address verifierContractAddress);

    // Errors
    error DuplicateOrgName();
    error DuplicateOrgAddr();
    error InvalidOrgId();
    error UserExists();
    error ReviewerMatchesAuthor();
    error InvalidReview();

    // Modifiers
    modifier isUniqueOrg(string calldata name_, address addr_) {
        if (s_orgNames[name_]) {
            revert DuplicateOrgName();
        }
        if (s_orgAddresses[addr_]) {
            revert DuplicateOrgAddr();
        }
        _;
    }

    modifier isValidOrgId(uint256 orgId_) {
        if (address(s_aoContracts[orgId_]) == address(0)) {
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
        s_orgNames[name_] = true;
        s_orgAddresses[addr_] = true;
        orgIds.increment();

        address _verifierAddr = deployVerifierNFTContract(
            orgId,
            name_,
            addr_,
            URI_
        );
        deployAppraiserOrganizationNFTContract(
            orgId,
            name_,
            addr_,
            URI_,
            _verifierAddr
        );
        emit LogAddOrganization(orgId);
    }

    function deployVerifierNFTContract(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_
    ) internal returns (address) {
        Verifier _verifier = new Verifier(orgId_, name_, addr_, URI_);
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
    ) internal {
        AppraiserOrganization _ao = new AppraiserOrganization(
            orgId_,
            name_,
            addr_,
            URI_,
            verifierAddr_
        );
        s_aoContracts[orgId_] = address(_ao);
        emit LogNFTContractDeployed(address(_ao));
    }

    function setAOContractAddress(uint256 orgId_, address aoAddress_)
        public
        onlyOwner
        isValidOrgId(orgId_)
    {
        s_aoContracts[orgId_] = aoAddress_;
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

    function voteOnReview(
        uint256 orgId_,
        uint256 reviewId_,
        bool isUpvote_
    ) external isValidOrgId(orgId_) isReviewerValid(orgId_, reviewId_) {
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

    function currentOrgId() public view returns (uint256) {
        return orgIds.current();
    }

    function numberOrganizations() public view returns (uint256) {
        return s_organizations.length;
    }

    // implement these functions to allow this contract to accept 1155 tokens
    // function onERC1155Received(
    //     address,
    //     address,
    //     uint256,
    //     uint256,
    //     bytes memory
    // ) public virtual returns (bytes4) {
    //     return this.onERC1155Received.selector;
    // }

    // function onERC1155BatchReceived(
    //     address,
    //     address,
    //     uint256[] memory,
    //     uint256[] memory,
    //     bytes memory
    // ) public virtual returns (bytes4) {
    //     return this.onERC1155BatchReceived.selector;
    // }
}
