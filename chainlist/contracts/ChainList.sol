pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable {
    // custom types
    struct Article {
        uint id; // ID start from 1
        address seller;
        address buyer;
        string name;
        string desc;
        uint256 price;
    }

    // state variables
    mapping (uint => Article) public articles;
    uint articleCounter;

    // events
    event LogSellArticle (
        uint indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle (
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    function kill() public onlyOwner {
        selfdestruct(owner); // transfer the contract amont out
    }

    function sellArticle(string _name, string _desc, uint256 _price) public {
        articleCounter++; // ID start from 1

        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _desc,
            _price
        );

        emit LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    function getNumberOfArticles() public view returns (uint) {
        return articleCounter;
    }

    function getArticlesForSale() public view returns (uint[]) {
        uint saleCount = 0;

        uint[] memory articleIds = new uint[](articleCounter + 1);
        for(uint i = 1; i <= articleCounter; i++){ // ID start from 1
            if(articles[i].buyer == 0x0){
                articleIds[saleCount] = articles[i].id;
                saleCount++;
            }
        }

        uint[] memory forSale = new uint[](saleCount);
        for(uint j = 0; j < saleCount; j++){
            forSale[j] = articleIds[j];
        }

        return forSale;
    }

    function buyArticle(uint _id) payable public {
        // special keyword: throw, assert, require, revert

        // we check whether there is an article for sale
        require(articleCounter > 0);

        // we check that the article exists
        require(_id > 0 && _id <= articleCounter);

        // we retrieve the article
        Article storage article = articles[_id];

        // we check whether there is an article for sale
        require(article.seller != 0x0);

        // we check that article has not been sold yet
        require(article.buyer == 0x0);

        // we don't allow the seller to buy his own article
        require(msg.sender != article.seller);

        // we check that the value sent corresponds to the price of the article
        require(msg.value == article.price);

        // keep buyer's info
        article.buyer = msg.sender;

        // buyer pay the seller
        article.seller.transfer(msg.value);

        // trigger the event
        emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }
}