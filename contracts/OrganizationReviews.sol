//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract OrganizationReviews is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _reviewIds;

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    function mintNFT(address player_, string memory tokenURI_) public {
        uint256 newItemId = _reviewIds.current();
        _safeMint(player_, newItemId);
        _setTokenURI(newItemId, tokenURI_);
        _reviewIds.increment();
    }
}
