// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "./Reviewer";

contract VRFv2Consumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    address private s_reviewerAddr;
    uint64 s_subscriptionId;

    // Rinkeby coordinator
    address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

    // The gas lane to use
    bytes32 keyHash =
        0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    mapping(uint256 => uint256) public s_assignedGroup; // requestId -> groupId
    mapping(uint256 => uint256[2]) public s_requestIds; // requestId -> [orgId, reviewId]
    address s_owner;

    constructor(uint64 subscriptionId, address reviewerAddr_)
        VRFConsumerBaseV2(vrfCoordinator)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        s_reviewerAddr = reviewerAddr_;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords(uint256 orgId_, uint256 reviewId_)
        external
        onlyOwner
    {
        // Will revert if subscription is not set and funded.
        uint256 _requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requestIds[_requestId] = [orgId_, reviewId_];
    }

    function fulfillRandomWords(
        uint256 requestId_,
        uint256[] memory randomWords
    ) internal override {
        uint256 _groupId = _convertToGroupId(randomWords[0]);
        uint256[2] _ids = s_requestIds[requestId_];
        uint256 _orgId = _ids[0];
        uint256 _reviewId = _ids[1];

        _updateReviewGroupId(_orgId, _reviewId, _groupId);
    }

    function _updateReviewGroupId(
        uint256 orgId_,
        uint256 reviewId_,
        uint256 groupId_
    ) private {
        Reviewer reviewerContract = Reviewer(s_reviewerAddr);
        reviewerContract.updateReviewGroupId(orgId_, reviewId_, groupId_);
    }

    function _convertToGroupId(uint256 randomWord_) private {
        uint256 _randomRange = (randomWord_ % 5);
        return _randomRange;
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
