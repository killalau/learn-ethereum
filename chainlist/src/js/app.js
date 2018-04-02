App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function () {
    var $sellForm = $('#sell-article-form');
    var $sellBtn = $('#sell-btn').click(function () {
      $sellForm.toggle();
    });

    $sellForm.submit(function (event) {
      event.preventDefault();
      App.sellArticle();
    });

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
      // listen to events
      App.listenToEvents();
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
          $artList.text('No article yet.');
          return;
        }

        // display info to UI
        var seller = article[0];
        var name = article[1];
        var desc = article[2];
        var price = article[3];

        $artList.append(App.createArticleElement(seller, name, desc, price));
      })
      .catch(function (err) {
        console.error(err);
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
    $item.find('.article__price').text('Price (ETH): ' + web3.fromWei(price));
    return $item;
  },

  sellArticle: function () {
    var $form = $('#sell-article-form');
    var name = $form.find('[name=name]').val().trim();
    var desc = $form.find('[name=desc]').val();
    var price = $form.find('[name=price]').val();
    price = web3.toWei(parseFloat(price || 0));

    if (name === '' || price <= 0) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList.deployed()
      .then(function (instance) {
        $form.find('input, textarea, button').prop('disabled', true);
        return instance.sellArticle(name, desc, price, { from: App.account, gas: 500000 });
      })
      .then(function (result) {
        $form.find('input, textarea, button').prop('disabled', false);
        $form.hide();
      })
      .catch(function (err) {
        $form.find('input, textarea, button').prop('disabled', false);
        console.error(err);
      });
  },

  // listen to events emitted by the contract
  listenToEvents: function () {
    App.contracts.ChainList.deployed()
      .then(function (instance) {
        instance.LogSellArticle({}, {})
          .watch(function (err, event) {
            if (err) {
              console.error(err);
              return;
            }

            /*
            event fields:
            - address          (contract address)
            - args             (event args)
            - blockHash
            - blockNumber
            - event            (event type)
            - logIndex         (event log index)
            - transactionHash
            - transactionIndex
            - type             (mined or ??)
            */
            console.log('new article for sell:', event);
            App.reloadArticles();
          });
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
