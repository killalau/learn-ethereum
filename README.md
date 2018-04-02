# Udemy - Become a Blockchain Developer with Ethereum and Solidity

## Install Development tools
```bash
# install nodejs

# install geth (OSX)
brew tab ethereum/ethereum
brew install ethereum

# install geth (ubuntu)
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum

# install ganache
# http://truffleframework.com/ganache/

# install truffle
npm install -g truffle
```

## Setup private node
```bash
cd private

# create genius block
puppeth

# init ethereum node
geth --datadir ./ init LearnEthereum.json

# create account
geth --datadir ./ account new

# start node
./startnode-osx.sh

# attach to node
geth attach
```