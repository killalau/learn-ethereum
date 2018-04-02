pragma solidity ^0.4.18;

contract ChainList {
    // state variables
    address seller;
    string name;
    string desc;
    uint256 price;

    function sellArticle(string _name, string _desc, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        desc = _desc;
        price = _price;
    }

    function getArticle() public view returns (
        address _seller,
        string _name,
        string _desc,
        uint256 _price
    ) {
        return (seller, name, desc, price);
    }
}