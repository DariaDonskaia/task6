// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract executeContract{

    uint256 public value;
    constructor(uint inputValue){
        value = inputValue;
    }
    function testFunc() view public returns (uint256){
        return value;
    }
}