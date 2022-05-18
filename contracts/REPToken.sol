//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract REPToken is ERC20 {
    constructor(uint256 initialSupply_) ERC20("Rep Token", "REP") {
        _mint(msg.sender, initialSupply_);
    }

    // prevent trading your reputation tokens
    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        // address owner = _msgSender();
        // _transfer(owner, to, amount);
        return false;
    }
}
