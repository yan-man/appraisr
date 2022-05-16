//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract REPToken is ERC777 {
    constructor(uint256 initialSupply_, address[] memory defaultOperators_)
        ERC777("Reputation", "REP", defaultOperators_)
    {
        _mint(msg.sender, initialSupply_, "", "");
    }
}
