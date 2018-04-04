const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const ChainList = artifacts.require('./ChainList.sol');

// test suite
contract('ChainList', (accounts) => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const name = 'article 1';
    const desc = 'Description for article 1';
    const price = 2;

    it('should throw exception when you try to buy an article but there is no article for sale', async () => {
        const instance = await ChainList.deployed();
        const buy = instance.buyArticle(1, { from: buyer, value: web3.toWei(price) });
        await expect(buy).to.be.rejected;

        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(0);
        expect(articles, 'articles for sale').to.have.length(0);
    });

    it('should throw exception when you try to buy an article not exists', async () => {
        const instance = await ChainList.deployed();
        await instance.sellArticle(name, desc, web3.toWei(price), { from: seller });
        const buy = instance.buyArticle(2, { from: seller, value: web3.toWei(price) });
        await expect(buy).to.be.rejected;

        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(1);
        expect(articles, 'articles for sale').to.have.length(1);
    });

    it('should throw exception when you try to buy your own article', async () => {
        const instance = await ChainList.deployed();
        const buy = instance.buyArticle(1, { from: seller, value: web3.toWei(price) });
        await expect(buy).to.be.rejected;

        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(1);
        expect(articles, 'articles for sale').to.have.length(1);
    });

    it('should throw exception when you send incorrect price', async () => {
        const instance = await ChainList.deployed();
        const buy = instance.buyArticle(1, { from: buyer, value: web3.toWei(price + 1) });
        await expect(buy).to.be.rejected;

        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(1);
        expect(articles, 'articles for sale').to.have.length(1);
    });

    it('should throw exception when you try to buy an article which is sold', async () => {
        const instance = await ChainList.deployed();
        const buy1 = instance.buyArticle(1, { from: buyer, value: web3.toWei(price) });
        await expect(buy1).to.be.fulfilled;

        const buy2 = instance.buyArticle(1, { from: accounts[3], value: web3.toWei(price) });
        await expect(buy2).to.be.rejected;

        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(1);
        expect(articles, 'articles for sale').to.have.length(0);

        const article = await instance.articles(1);
        expect(article[0].toNumber(), 'article id').to.equal(1);
        expect(article[1], 'seller').to.equal(seller);
        expect(article[2], 'buyer').to.equal(buyer);
        expect(article[3], 'name').to.equal(name);
        expect(article[4], 'desc').to.equal(desc);
        expect(article[5].toString(), 'price').to.equal(web3.toWei(price));
    });
});