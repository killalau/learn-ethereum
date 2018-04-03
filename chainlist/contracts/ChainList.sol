pragma solidity ^0.4.18;

contract ChainList {
    // state variables
    address seller;
    address buyer;
    string name;
    string desc;
    uint256 price;

    // events
    event LogSellArticle (
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle (
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    function sellArticle(string _name, string _desc, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        desc = _desc;
        price = _price;

        emit LogSellArticle(seller, name, price);
    }

    function getArticle() public view returns (
        address _seller,
        address _buyer,
        string _name,
        string _desc,
        uint256 _price
    ) {
        return (seller, buyer, name, desc, price);
    }

    function buyArticle() payable public {
        // special keyword: throw, assert, require, revert

        // we check whether there is an article for sale
        require(seller != 0x0);

        // we check that article has not been sold yet
        require(buyer == 0x0);

        // we don't allow the seller to buy his own article
        require(msg.sender != seller);

        // we check that the value sent corresponds to the price of the article
        require(msg.value == price);

        // keep buyer's info
        buyer = msg.sender;

        // buyer pay the seller
        seller.transfer(msg.value);

        // trigger the event
        emit LogBuyArticle(seller, buyer, name, price);
    }
}