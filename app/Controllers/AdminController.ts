// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import CardTransaction from "App/Models/CardTransaction";
import CoinTransaction from "App/Models/CoinTransaction";
import UserAmount from "App/Models/UserAmount";
import CardType from "App/Models/CardType";
import Coin from "App/Models/Coin"
// import UserAccount from 'App/Models/UserAccount'
import Status from "App/Models/Status";
import Database from "@ioc:Adonis/Lucid/Database";


export default class AdminsController {
  public async index({ auth, response }) {
    const user = await auth.user;
    await user.load("role");
    return response.send({ message: user.role });
  }
  //all User
  public async allUser({ response }) {
    try {
      const user =  await User
      .query()
      .preload('userAmount')
      return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }

   //single User
   public async user({ response, params }) {
    try {
      const id = params.id
      const user =  await User.find(id)
      await user?.load((loader) => {
        loader.load('userAmount')
        .load('userAmount')
        .load('userAccounts')
        .load('coinTransaction')
        .load('cardTransaction')
        .load('userWithdrawal')
      })
      return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }


  //change user status
  public async userStatus({ params, response }) {
    try {
      // console.log(request)
      const id = params.id
      console.log(id)
      const user =  await User.find(id);
      !user?.banned
      user?.save()
      return response.send({ message: user });
    } catch (error) {
      console.log(error)
      return response.badRequest(error);
    }
  }

 

  public async revenue({ response }) {
    try {
      const card = await Database
      .from('card_transactions')
      .where('status', 4)
      .sum('total')

      const coin = await Database
      .from('coin_transactions')
      .where('status', 4)
      .sum('total')
      
      const total_array = coin.concat(card) 
      const total = total_array.reduce((accum, item) => accum + Number(item.sum), 0)
      
     
      return response.send({ message: total });
      
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async pending({ response }) {
    try {
      const pending_card = await Database.rawQuery(
        `select * from card_transactions where status = ?`,
        [1]
      );
      const pending_coin = await Database.rawQuery(
        `select * from coin_transactions where status = ?`,
        [1]
      );

      const total = pending_card.rowCount + pending_coin.rowCount;
      if (total > 0){
        return response.send({ message: total });
      }else{
        return response.send({ message: 0 });
      }
      
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async weeklyCardExchange({ response }) {
    try {
      const weeklyCard = await Database.rawQuery(
        `select * from card_transactions`
      );
      return response.send({ message: weeklyCard });
      console.log(weeklyCard);
    } catch (error) {
      console.log(error);
    }
  }

  //get card rate
  public async getCardRate({response}){
    try {
      const data = await CardType.all()
      return response.send({message: data})
    } catch (error) {
      return error.response.send({message: 'something went wrong'})
    }
  }

  public async getCoinRate({response}){
    try {
      const data = await Coin.all()
      return response.send({message: data})
    } catch (error) {
      return error.response.send({message: 'something went wrong'})
    }
  }

  //get all card transactions
  public async getCardsTransactions({response}) {
    try {
      const transactions = await CardTransaction
      .query()
      .preload('status_name')
      .preload('card')
      .preload('user')
      // console.log(transactions)
      return response.send({ message: transactions });
    }catch(error) {
      return response.badRequest(error);
    }
  }

   //get all card transactions
   public async getCoinsTransactions({response}) {
    try {
      const transactions = await CoinTransaction
      .query()
      .preload('status_name')
      .preload('coin')
      .preload('user')
      // console.log(transactions)
      return response.send({ message: transactions });
    }catch(error) {
      return response.badRequest(error);
    }
  }

   //get single card transaction
   public async getCoin({ params, response }) {
    try {
      const transaction = await CoinTransaction.findBy("id", params.id);
      await transaction?.load((loader) => {
        loader.load("coin").load("status_name").load("user");
      });
      return response.send({ message: transaction });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //get single card transaction
  public async getCard({ params, response }) {
    try {
      const transaction = await CardTransaction.findBy("id", params.id);
      await transaction?.load((loader) => {
        loader.load("card").load("status_name").load("user");
      });
      return response.send({ message: transaction });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //change transaction status
  public async updateCardStatus({ params, request, response }) {
    try {
      const transaction = await CardTransaction.findByOrFail("id", params.id);
      transaction.status = request.input("status");
      transaction.save();
      return response.send({ message: transaction });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //confirm card transaction
  public async confirmCardTransaction({ params, response }) {
    try {
      const transaction = await CardTransaction.findByOrFail("id", params.id);
      const status = await Status.find(transaction.status);
      const wallet = await UserAmount.findBy("user_id", transaction.user_id);

      if (status?.name !== "completed") {
        return response
          .status(403)
          .send({
            message: "Kind update the status of this transaction to completed",
          });
      }

      if (transaction?.completed === true) {
        return response
          .status(403)
          .send({ message: "This transaction has been paid out" });
      }
      transaction.completed = true;
      const pre = Number(wallet?.amount);
      const value = Number(
        transaction.$attributes.rate * transaction.$attributes.amount + pre
      );
      await wallet?.merge({ amount: String(value) }).save();
      transaction?.save();

      return response.send({ message: transaction });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  //get all coin transactions
  public async getCoinTransactions({ response }) {
    try {
      const transactions = await CoinTransaction.all();
      transactions.forEach((transaction) => {
        transaction?.load((loader) => {
          loader.load("coin").load("status_name").load("user");
        });
      });
      return response.send({ message: transactions });
    } catch (error) {}
  }

  //get all user Amount
  public async userWallet({ response }) {
    try {
      const wallets = await UserAmount.all();
      wallets.forEach((wallet) => {
        wallet?.load((loader) => {
          loader.load("user");
        });
      });
      return response.send({ message: wallets });
    } catch (error) {
      return response.badRequest(error);
    }
  }
}
