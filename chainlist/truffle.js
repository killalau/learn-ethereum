module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
        },

        learnEth: {
            host: 'localhost',
            port: 8545,
            network_id: '4224',
            gas: 4700000,
            // from: '0x3bb62d3041cd973a239e194b1a3f4ec20f09f931',
        }
    },
};
