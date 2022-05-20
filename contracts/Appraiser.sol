//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AppraiserOrganization.sol";
import "./Verifier.sol";
import "./Users.sol"; // to use struct

contract Appraiser is Ownable {
    using Counters for Counters.Counter;
    using Users for Users.User;

    // State Vars
    Counters.Counter public s_orgIds;
    mapping(uint256 => uint256) public s_organizations; // orgId -> intbool isActive
    mapping(uint256 => address) public s_vContracts; // orgId -> deployed Verifier contract
    mapping(uint256 => address) public s_aoContracts; // orgId -> deployed AO contract
    mapping(string => uint256) private s_orgNames; // org name -> intbool exists flag
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
    error Appraiser__DuplicateOrgName();
    error Appraiser__InvalidOrgId();
    error Appraiser__VoterMatchesAuthor();
    error Appraiser__InvalidReview();

    // Modifiers
    modifier isValidOrgId(uint256 orgId_) {
        if (address(s_aoContracts[orgId_]) == address(0)) {
            revert Appraiser__InvalidOrgId();
        }
        _;
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
        deployAppraiserOrganizationNFTContract(
            _orgId,
            name_,
            addr_,
            URI_,
            _verifierAddr
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

    function numberOrganizations() public view returns (uint256) {
        return s_orgIds.current();
    }
}
