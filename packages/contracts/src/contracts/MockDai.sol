// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDai is ERC20 {
    constructor() public ERC20("Dai TestToken", "DAI") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function giveMeTokens(uint amount) public {
        _mint(msg.sender, amount * 10**18);
    }
}
