pragma solidity ^0.4.18;

contract Ownable {
    // state variables
    address owner;

    // modifiers
    modifier onlyOwner() {
        // only allow the contract owner to run
        require(msg.sender == owner);
        _;
    }

    function Ownable() public {
        owner = msg.sender;
    }
}