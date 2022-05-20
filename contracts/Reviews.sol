//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "hardhat/console.sol";

library Reviews {
    struct Review {
        uint256 rating;
        string review;
        uint256 upvotes;
        uint256 downvotes;
    }
}
