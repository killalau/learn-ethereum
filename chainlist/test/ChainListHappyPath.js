var ChainList = artifacts.require('./ChainList.sol');

// test suite
contract('ChainList', (accounts) => {
    const seller = accounts[1];
    const name = 'article 1';
    const desc = 'Description for article 1';
    const price = 2;

    it('should be initialized with empty values', async () => {
        const instance = await ChainList.deployed();
        const data = await instance.getArticle();

        assert.equal(data[0], 0x0, 'seller must be empty');
        assert.equal(data[1], '', 'article name must be empty');
        assert.equal(data[2], '', 'article description must be empty');
        assert.equal(data[3].toNumber(), 0, 'article price must be zero');
    });

    it('should sell an article', async () => {
        const instance = await ChainList.deployed();
        await instance.sellArticle(name, desc, web3.toWei(price), { from: seller });
        const data = await instance.getArticle();

        assert.equal(data[0], seller, 'seller must be ' + seller);
        assert.equal(data[1], name, 'article name must be ' + name);
        assert.equal(data[2], desc, 'article description must be ' + desc);
        assert.equal(data[3].toNumber(), web3.toWei(price), 'article price must be ' + web3.toWei(price));
    });
});