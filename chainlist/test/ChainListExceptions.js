var ChainList = artifacts.require('./ChainList.sol');

// test suite
contract('ChainList', (accounts) => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const name = 'article 1';
    const desc = 'Description for article 1';
    const price = 2;

    it('should throw exception when you try to buy an article but there is no article for sale', async () => {
        const instance = await ChainList.deployed();
        await instance.buyArticle({ from: buyer, value: web3.toWei(price) })
            .then(assert.fail)
            .catch(() => assert(true));

        const data = await instance.getArticle();
        assert.equal(data[0], 0x0, 'seller must be empty');
        assert.equal(data[1], 0x0, 'buyer must be empty');
        assert.equal(data[2], '', 'article name must be empty');
        assert.equal(data[3], '', 'article description must be empty');
        assert.equal(data[4].toNumber(), 0, 'article price must be zero');
    });

    it('should throw exception when you try to buy your own article', async () => {
        const instance = await ChainList.deployed();
        await instance.sellArticle(name, desc, web3.toWei(price), { from: seller });
        await instance.buyArticle({ from: seller, value: web3.toWei(price) })
            .then(assert.fail)
            .catch(() => assert(true));

        const data = await instance.getArticle();
        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], 0x0, 'buyer must be empty');
        assert.equal(data[2], name, 'article name must be ' + name);
        assert.equal(data[3], desc, 'article description must be ' + desc);
        assert.equal(data[4].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
    });

    it('should throw exception when you send incorrect price', async () => {
        const instance = await ChainList.deployed();
        await instance.buyArticle({ from: buyer, value: web3.toWei(price + 1) })
            .then(assert.fail)
            .catch(() => assert(true));

        const data = await instance.getArticle();
        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], 0x0, 'buyer must be empty');
        assert.equal(data[2], name, 'article name must be ' + name);
        assert.equal(data[3], desc, 'article description must be ' + desc);
        assert.equal(data[4].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
    });

    it('should throw exception when you try to buy an article which is sold', async () => {
        const instance = await ChainList.deployed();
        await instance.buyArticle({ from: buyer, value: web3.toWei(price) })
            .then(() => assert(true))
            .catch(assert.fail);
        await instance.buyArticle({ from: accounts[3], value: web3.toWei(price) })
            .then(assert.fail)
            .catch(() => assert(true));

        const data = await instance.getArticle();
        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], buyer, 'buyer must be ' + buyer);
        assert.equal(data[2], name, 'article name must be ' + name);
        assert.equal(data[3], desc, 'article description must be ' + desc);
        assert.equal(data[4].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
    });
});