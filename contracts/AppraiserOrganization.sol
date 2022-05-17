//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// rename OrganizationReviews to AppraiserOrganization
contract AppraiserOrganization is ERC1155, Ownable {
    using Counters for Counters.Counter;

    struct Review {
        uint256 rating;
        string review;
    }

    Counters.Counter private _reviewIds;

    constructor(string memory URI_) ERC1155(URI_) {}

    // address player_,
    // string memory tokenURI_,
    // uint256 rating,
    // string memory review
    function mintNFT() public {
        // uint256 newItemId = _reviewIds.current();
        _mint(msg.sender, 1, 10**18, "");
    }
}
