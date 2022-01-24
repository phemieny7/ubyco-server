import Route from '@ioc:Adonis/Core/Route'

//Authentication / General route
Route.post('register', 'AuthController.register')
Route.put('verify', 'AuthController.verify')
Route.post('login', 'AuthController.login')
Route.post('logout', 'AuthController.logout')
Route.put('forget', 'AuthController.forget')
Route.get('/', 'AuthController.index').middleware('auth')
Route.get('/list-banks', 'UserController.listBanks')
Route.get('/card', 'UserController.card')
Route.get('/get-picture/:filename', 'UserController.getPicture')
Route.post('/subscribe', 'UserController.newSubscriber')
Route.delete('/subscribe', 'UserController.deleteSubscriber')
// Route.get('/card-type', 'UserController.cardType')


// user route
Route.group(() => {
    Route.get('/', 'UserController.getProfile')
    Route.put('/profile', 'UserController.updateProfile')
    Route.get('/get-account', 'UserController.getAccount')
    Route.get('/get-account-name', 'UserController.getAccountName')
    Route.post('/add-account', 'UserController.addAccount')
    Route.post('/delete-account', 'UserController.deleteAccount')
    Route.get('/card', 'UserController.card')
    Route.get('/card-type', 'UserController.cardType')
    Route.get('/coin', 'UserController.coin')
    Route.post('/rate-calculator', 'UserController.rateCalculator')
    Route.post('/withdraw', 'UserController.withdraw')
    Route.get('/all_card', 'AdminController.cardRate')
    Route.get('/card/:id', 'AdminController.getCard')
}).prefix('/user').middleware('auth')
//giftcard
Route.group(() => {
    Route.post('/initiate-trade', 'GiftCardController.intiateTrade')
    Route.get('/trades', 'GiftCardController.getAllTrade')
    Route.get('/trade', 'GiftCardController.getTrade')
    Route.get('/trade-by/:id', 'GiftCardController.getTradeBy')
}).prefix('/giftcard').middleware('auth')

//bitcoin
Route.group(() => {
    Route.post('/initiate-trade', 'BitcoinController.intiateTrade')
    Route.get('/trade/:id', 'BitcoinController.getTrade')
    Route.get('/trades', 'BitcoinController.getAllTrade')
    Route.get('/trade-by/:id', 'BitcoinController.getTradeBy')
}).prefix('/coin').middleware('auth')

Route.group(() => {
    Route.get('/', 'AdminController.index')
    //get ALL USER
    Route.get('/user', 'AdminController.allUser')
    //get admin users
    Route.get('/adminuser', 'AdminController.adminUser')
    //create admin
    Route.post('/create-admin', 'AdminController.createAdmin')
    //update admin
    Route.put('/update-admin', 'AdminController.updateAdmin')
    //delete admin
    Route.post('/delete-admin', 'AdminController.deleteAdmin')
    //CALCULATE REVENUE
    Route.get('/revenue','AdminController.revenue')
    //pending trade counter
    Route.get('/pending-trade', 'AdminController.pending')
    //weekly card exchange calculation
    Route.get('/weekly-card-exchange', 'AdminController.weeklyCardExchange')
    Route.get('/user/:id', 'AdminController.user')
    Route.get('/card_brand', 'UserController.card')
    Route.get('/card_rate', 'AdminController.getCardRate')
    Route.get('/coin_rate', 'AdminController.getCoinRate')
    Route.put('/user_status', 'AdminController.userStatus')
    Route.get('/all_card', 'AdminController.cardRate')
    //card Crud
    Route.post('/create_card', 'AdminController.card')
    Route.put('/update_card', 'AdminController.updateCard')
    Route.post('/delete_card', 'AdminController.deleteCard')
    Route.post('/create_card_rate', 'AdminController.createCardRate')
    Route.put('/update_card_rate', 'AdminController.updateCardRate')
    Route.post('/delete_card_rate', 'AdminController.deleteCardRate')

    //coin Crud
    Route.post('/create_coin', 'AdminController.coin')
    Route.put('/update_coin', 'AdminController.updateCoin')
    Route.post('/delete_coin', 'AdminController.deleteCoin')

    Route.get('/card', 'AdminController.getCardsTransactions')
    Route.get('/card/:id', 'AdminController.getCard')
    Route.get('/cardhistroy', 'AdminController.getCardTransactionsHistory')
    Route.put('/card', 'AdminController.updateCardStatus')
    Route.put('/confirm-card', 'AdminController.confirmCardTransaction')
    Route.put('/change-card-rate', 'AdminController.changeCardRate')

    Route.get('/coin', 'AdminController.getCoinsTransactions')
    Route.get('/coinhistroy', 'AdminController.getCoinsTransactionsHistory')
    Route.get('/coin/:id', 'AdminController.getCoin')
    Route.put('/coin', 'AdminController.updateCoinStatus')
    Route.put('/confirm-coin', 'AdminController.confirmCoinTransaction')

    Route.get('/withdrawal', 'AdminController.allWithdrawal')
    Route.get('/withdrawal/:id', 'AdminController.userWithdrawal')

    Route.put('/initiate-withdrawal', 'AdminController.initiateWithdrawal')
    Route.put('/verify-withdrawal', 'AdminController.verifyWithdrawal')

    //newsletter
    Route.post('/create-newsletter', 'AdminController.createNewsLetter')
    Route.get('/get-newsletter', 'AdminController.getNewsLetter')

    Route.get('/subscriber', 'AdminController.getSubscribers')
    Route.post('/send-news-letter', 'AdminController.sendNewsLette')
    Route.post('/create-newsletter-template', 'AdminController.createNewsLeterTemplate')
    Route.delete('/delete-newsletter-template', 'AdminController.deleteNewsLeterTemplate')
    Route.put('/update-newsletter-template', 'AdminController.updateNewsLeterTemplate')

}).prefix('/admin').middleware(['auth', 'admin'])