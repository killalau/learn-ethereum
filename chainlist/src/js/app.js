App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function () {
    /*
     * Replace me...
     */

    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      // create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  initContract: function () {
    // get the contract artifact file
    $.getJSON('ChainList.json', function (artifact) {
      // use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(artifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  displayAccountInfo: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('.account-info__account').text(account);

        web3.eth.getBalance(account, function (err, bal) {
          var balTxt = web3.fromWei(bal) + ' ETH';
          $('.account-info__balance').text(balTxt);
        });
      }
    });
  },

  reloadArticles: function () {
    // refresh account info because the balance might have changed
    App.displayAccountInfo();

    var $artList = $('#article-list').empty();

    App.contracts.ChainList.deployed()
      .then(function (instance) {
        return instance.getArticle();
      })
      .then(function (article) {
        if (article[0] == 0x0) {
          // no article
          return;
        }

        // display info to UI
        var seller = article[0];
        var name = article[1];
        var desc = article[2];
        var price = article[3];

        $artList.append(App.createArticleElement(seller, name, desc, price));
      });
  },

  createArticleElement: function (seller, name, desc, price) {
    var $item = $(`
    <div class="article-list__item article">
      <div class="article__name"></div>
      <div class="article__desc"></div>
      <div class="article__price"></div>
      <div class="article__seller"></div>
      <button class="article__buy-btn btn btn-primary">Buy</button>
    </div>
    `);
    var isCurrentAccount = seller == App.account;
    $item.data({ seller, name, desc, price, isCurrentAccount });
    $item.find('.article__seller').text('Sold by: ' + (isCurrentAccount ? 'You' : seller));
    $item.find('.article__name').text(name);
    $item.find('.article__desc').text(desc);
    $item.find('.article__price').text('Price: ' + web3.fromWei(price) + ' ETH');
    return $item;
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
