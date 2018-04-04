var ChainList = artifacts.require('./ChainList.sol');

// test suite
contract('ChainList', (accounts) => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const name1 = 'article 1';
    const desc1 = 'Description for article 1';
    const price1 = 1;
    const name2 = 'article 2';
    const desc2 = 'Description for article 2';
    const price2 = 2;

    it('should be initialized with empty values', async () => {
        const instance = await ChainList.deployed();
        const size = await instance.getNumberOfArticles();
        const articles = await instance.getArticlesForSale();

        expect(size.toNumber(), 'number of articles').to.equal(0);
        expect(articles, 'articles for sale').to.have.length(0);
    });

    it('should sell the first article', async () => {
        const instance = await ChainList.deployed();
        const receipt = await instance.sellArticle(name1, desc1, web3.toWei(price1), { from: seller });
        expect(receipt.logs, 'logs').to.have.length(1);
        expect(receipt.logs[0], 'log').to.have.property('event').that.equal('LogSellArticle');
        expect(receipt.logs[0].args._id.toNumber(), 'log.args._id').to.equal(1);
        expect(receipt.logs[0].args._seller, 'log.args._seller').to.equal(seller);
        expect(receipt.logs[0].args._name, 'log.args._name').to.equal(name1);
        expect(receipt.logs[0].args._price.toString(), 'log.args._price').to.equal(web3.toWei(price1));

        const size = await instance.getNumberOfArticles();
        const articleIds = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(1);
        expect(articleIds, 'articles for sale').to.have.length(1);
        expect(articleIds[0].toNumber(), 'article id').to.equal(1);

        const article = await instance.articles(1);
        expect(article[0].toNumber(), 'article id').to.equal(1);
        expect(article[1], 'seller').to.equal(seller);
        expect(parseInt(article[2]), 'buyer').to.equal(0x0);
        expect(article[3], 'name').to.equal(name1);
        expect(article[4], 'desc').to.equal(desc1);
        expect(article[5].toString(), 'price').to.equal(web3.toWei(price1));
    });

    it('should sell the second article', async () => {
        const instance = await ChainList.deployed();
        const receipt = await instance.sellArticle(name2, desc2, web3.toWei(price2), { from: seller });
        expect(receipt.logs, 'logs').to.have.length(1);
        expect(receipt.logs[0], 'log').to.have.property('event').that.equal('LogSellArticle');
        expect(receipt.logs[0].args._id.toNumber(), 'log.args._id').to.equal(2);
        expect(receipt.logs[0].args._seller, 'log.args._seller').to.equal(seller);
        expect(receipt.logs[0].args._name, 'log.args._name').to.equal(name2);
        expect(receipt.logs[0].args._price.toString(), 'log.args._price').to.equal(web3.toWei(price2));

        const size = await instance.getNumberOfArticles();
        const articleIds = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(2);
        expect(articleIds, 'articles for sale').to.have.length(2);
        expect(articleIds[1].toNumber(), 'article id').to.equal(2);

        const article = await instance.articles(2);
        expect(article[0].toNumber(), 'article id').to.equal(2);
        expect(article[1], 'seller').to.equal(seller);
        expect(parseInt(article[2]), 'buyer').to.equal(0x0);
        expect(article[3], 'name').to.equal(name2);
        expect(article[4], 'desc').to.equal(desc2);
        expect(article[5].toString(), 'price').to.equal(web3.toWei(price2));
    });

    it('should buy an article', async () => {
        const instance = await ChainList.deployed();
        const origBuyerBalance = web3.fromWei(web3.eth.getBalance(buyer)).toNumber();
        const origSellerBalance = web3.fromWei(web3.eth.getBalance(seller)).toNumber();
        const receipt = await instance.buyArticle(1, { from: buyer, value: web3.toWei(price1) });
        expect(receipt.logs, 'logs').to.have.length(1);
        expect(receipt.logs[0], 'log').to.have.property('event').that.equal('LogBuyArticle');
        expect(receipt.logs[0].args._id.toNumber(), 'log.args._id').to.equal(1);
        expect(receipt.logs[0].args._seller, 'log.args._seller').to.equal(seller);
        expect(receipt.logs[0].args._buyer, 'log.args._buyer').to.equal(buyer);
        expect(receipt.logs[0].args._name, 'log.args._name').to.equal(name1);
        expect(receipt.logs[0].args._price.toString(), 'log.args._price').to.equal(web3.toWei(price1));

        const size = await instance.getNumberOfArticles();
        const articleIds = await instance.getArticlesForSale();
        expect(size.toNumber(), 'number of articles').to.equal(2);
        expect(articleIds, 'articles for sale').to.have.length(1);

        const newBuyerBalance = web3.fromWei(web3.eth.getBalance(buyer)).toNumber();
        const newSellerBalance = web3.fromWei(web3.eth.getBalance(seller)).toNumber();
        expect(newSellerBalance, 'seller balance').to.equal(origSellerBalance + price1);
        expect(newBuyerBalance, 'buyer balance').to.lt(origBuyerBalance - price1);

        const article = await instance.articles(1);
        expect(article[0].toNumber(), 'article id').to.equal(1);
        expect(article[1], 'seller').to.equal(seller);
        expect(article[2], 'buyer').to.equal(buyer);
        expect(article[3], 'name').to.equal(name1);
        expect(article[4], 'desc').to.equal(desc1);
        expect(article[5].toString(), 'price').to.equal(web3.toWei(price1));
    });
});