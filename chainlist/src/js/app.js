App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function () {
    var $sellForm = $('#sell-article-form');
    var $sellBtn = $('#sell-btn').click(function () {
      $sellForm.toggle();
    });

    $sellForm.submit(App.sellArticle);

    $('body').on('click', '.article__buy-btn', App.buyArticle);

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
    // advoid re-entry
    if (App.loading) return;

    // refresh account info because the balance might have changed
    App.displayAccountInfo();

    var $artList = $('#article-list').empty();

    var cachedInstance;
    App.loading = true;
    App.contracts.ChainList.deployed()
      .then(function (instance) {
        cachedInstance = instance;
        return instance.getArticlesForSale();
      })
      .then(function (articleIds) {
        if (!articleIds.length) {
          // no article
          $artList.text('No article yet.');
          return [];
        }

        var promises = articleIds.map(function (id) {
          return cachedInstance.articles(id);
        });
        return Promise.all(promises);
      })
      .then(function (articles) {
        for (var aid in articles) {
          // display info to UI
          var article = articles[aid];
          var id = article[0];
          var seller = article[1];
          var buyer = article[2];
          var name = article[3];
          var desc = article[4];
          var price = article[5];

          $artList.append(App.createArticleElement(id, seller, buyer, name, desc, price));
        }
        App.loading = false;
      })
      .catch(function (err) {
        console.error(err);
        App.loading = false;
      });
  },

  createArticleElement: function (id, seller, buyer, name, desc, price) {
    var $item = $(`
    <div class="article-list__item article">
      <div class="article__name"></div>
      <div class="article__desc"></div>
      <div class="article__price"></div>
      <div class="article__seller"></div>
      <div class="article__buyer"></div>
      <button class="article__buy-btn btn btn-primary">Buy</button>
    </div>
    `);
    var sellByYou = seller == App.account;
    var buyByYou = buyer == App.account;
    $item.find('.article__seller').text('Sold by: ' + (sellByYou ? 'You' : seller));
    $item.find('.article__buyer').text('Sold to: ' + (buyByYou ? 'You' : buyer));
    $item.find('.article__name').text(name);
    $item.find('.article__desc').text(desc);
    $item.find('.article__price').text('Price (ETH): ' + web3.fromWei(price));
    $item.find('.article__buy-btn').data({ id, seller, name, desc, price, sellByYou, buyByYou });
    if (buyer != 0x0) {
      $item.addClass('article-list__item--sold');
    }
    if (seller == App.account) {
      $item.addClass('article-list__item--own');
    }
    return $item;
  },

  sellArticle: function (event) {
    event.preventDefault();
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
    App.contracts.ChainList.deployed()
      .then(function (instance) {
        instance.LogSellArticle({}, {})
          .watch(function (err, event) {
            if (err) {
              console.error(err);
              return;
            }

            console.log('new event article for sell:', event);
            App.reloadArticles();
          });

        instance.LogBuyArticle({}, {})
          .watch(function (err, event) {
            if (err) {
              console.error(err);
              return;
            }

            console.log('new event article bought:', event);
            App.reloadArticles();
          });
      });
  },

  buyArticle: function (event) {
    event.preventDefault();
    var $el = $(this);
    var data = $el.data();

    App.contracts.ChainList.deployed()
      .then(function (instance) {
        return instance.buyArticle(data.id, { from: App.account, value: data.price, gas: 500000 });
      })
      .catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
