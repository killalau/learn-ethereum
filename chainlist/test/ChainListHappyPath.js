var ChainList = artifacts.require('./ChainList.sol');

// test suite
contract('ChainList', (accounts) => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const name = 'article 1';
    const desc = 'Description for article 1';
    const price = 2;

    it('should be initialized with empty values', async () => {
        const instance = await ChainList.deployed();
        const data = await instance.getArticle();

        assert.equal(data[0], 0x0, 'seller must be empty');
        assert.equal(data[1], 0x0, 'buyer must be empty');
        assert.equal(data[2], '', 'article name must be empty');
        assert.equal(data[3], '', 'article description must be empty');
        assert.equal(data[4].toNumber(), 0, 'article price must be zero');
    });

    it('should sell an article', async () => {
        const instance = await ChainList.deployed();
        await instance.sellArticle(name, desc, web3.toWei(price), { from: seller });
        const data = await instance.getArticle();

        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], 0x0, 'buyer must be empty');
        assert.equal(data[2], name, 'article name must be ' + name);
        assert.equal(data[3], desc, 'article description must be ' + desc);
        assert.equal(data[4].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
    });

    it('should emit an event when a new article is sold', async () => {
        const instance = await ChainList.deployed();
        const receipt = await instance.sellArticle(name, desc, web3.toWei(price), { from: seller });

        assert.equal(receipt.logs.length, 1, 'one event should have been triggered');
        assert.equal(receipt.logs[0].event, 'LogSellArticle', 'event should be LogSellArticle');
        assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
        assert.equal(receipt.logs[0].args._name, name, 'event name must be ' + name);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(price), 'event name must be ' + web3.toWei(price));
    });

    it('should buy an article', async () => {
        const instance = await ChainList.deployed();
        const origBuyerBalance = web3.fromWei(web3.eth.getBalance(buyer)).toNumber();
        const origSellerBalance = web3.fromWei(web3.eth.getBalance(seller)).toNumber();
        const receipt = await instance.buyArticle({ from: buyer, value: web3.toWei(price) });
        const data = await instance.getArticle();
        const newBuyerBalance = web3.fromWei(web3.eth.getBalance(buyer)).toNumber();
        const newSellerBalance = web3.fromWei(web3.eth.getBalance(seller)).toNumber();

        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], buyer, 'buyer must be ' + buyer);
        assert.equal(data[2], name, 'article name must be ' + name);
        assert.equal(data[3], desc, 'article description must be ' + desc);
        assert.equal(data[4].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
        assert.equal(receipt.logs.length, 1, 'two event should have been triggered');
        assert.equal(receipt.logs[0].event, 'LogBuyArticle', 'event should be LogBuyArticle');
        assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, 'event buyer must be ' + buyer);
        assert.equal(receipt.logs[0].args._name, name, 'event name must be ' + name);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(price), 'event name must be ' + web3.toWei(price));
        assert.equal(newSellerBalance, origSellerBalance + price, 'Seller balance should update correctly');
        assert(newBuyerBalance <= origBuyerBalance - price, 'Buyer balance should update correctly');

    });
});