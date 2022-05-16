//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract REPToken is ERC20 {
    constructor(uint256 initialSupply_) ERC20("Reputation", "REP") {
        _mint(msg.sender, initialSupply_);
    }
}
