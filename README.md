# Udemy - Become a Blockchain Developer with Ethereum and Solidity

## Install Development tools
```bash
# install nodejs (ubuntu)
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs


# install geth (OSX)
brew tab ethereum/ethereum
brew install ethereum

# install geth (ubuntu)
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install -y ethereum

# install ganache
# http://truffleframework.com/ganache/

# install truffle
npm install -g truffle
```

## Setup private node
```bash
cd private

# create account
geth --datadir ./ account new

# create genius block
puppeth

# init ethereum node
geth --datadir ./ init genesis.json

# start node
./startnode-osx.sh

# attach to node
geth attach
```