// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import CardTransaction from "App/Models/CardTransaction";
import CoinTransaction from "App/Models/CoinTransaction";
import UserAmount from "App/Models/UserAmount";
import CardType from "App/Models/CardType";
import Card from "App/Models/Card";
import NewLetterTemplate from "App/Models/NewLetterTemplate";

import Coin from "App/Models/Coin";
// import UserAccount from 'App/Models/UserAccount'
// import Status from "App/Models/Status";
import UserWithdrawal from "App/Models/UserWithdrawal";
import Database from "@ioc:Adonis/Lucid/Database";
import * as Helper from "../common";

import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Subscriber from "App/Models/Subscriber";

export default class AdminsController {
  public async index({ auth, response }) {
    const user = await auth.user;
    await user.load("role");
    return response.send({ message: user.role });
  }
  //all User
  public async allUser({ response }) {
    try {
      const user = await User.query().where('role_id', 1).preload("userAmount");
      return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async adminUser({ response }) {
    try {
      const user = await User
      .query() // 👈now have access to all query builder methods
      .where('role_id', 2)
      return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async createAdmin({ response,request }) {
    const data = schema.create({
      fullname: schema.string({}, [rules.required()]),
      phone: schema.string({ trim: true }, [rules.required()]),
      email: schema.string({ escape: true }, [rules.required(), rules.email()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
          "email.unique": "email already exist",
          "phone.unique": "phone number already exist",
          email: "Invalid email input",
        },
      });
      const user = new User();
      user.fullname = payload.fullname,
      user.phone = payload.phone,
      user.email = payload.email,
      user.password = 'ubycoadmin123'
      user.role_id = 2,
      user.is_verified = true,
      user.save();
      //send admin details
      await Helper.sendToken(payload.phone, `your Ubyco admin detail is ${payload.email} and password is ubycoadmin123`)

      return response.send(user);
    } catch (error) {
      return response.badRequest(error);
    }
  }

   public async updateAdmin({ response,request}) {
    const data = schema.create({
      fullname: schema.string({}, [rules.required()]),
      phone: schema.string({ trim: true }, [rules.required()]),
      email: schema.string({ escape: true }, [rules.required(), rules.email()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
          "email.unique": "email already exist",
          "phone.unique": "phone number already exist",
          email: "Invalid email input",
        },
      });
      const {id} = request.body()

      const user = await User.findOrFail(id);
      user.fullname = payload.fullname,
      user.phone = payload.phone,
      user.email = payload.email,
      user.banned = payload.status,
      user?.save();
      //send admin details
      // await Helper.sendToken(payload.phone, `your Ubyco admin detail is ${payload.email} and password is ubycoadmin123`)

      return response.send(user);
    } catch (error) {
      console.log(error)
      return response.badRequest(error);
    }
  }

  public async deleteAdmin({request, response}){
    try{
    const {id} = request.body()
    const user = await User.findByOrFail('id', id);
    user.delete()
    return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }
  //single User
  public async user({ response, params }) {
    try {
      const id = params.id;
      const user = await User.findByOrFail('id', id);
      await user?.load((loader) => {
        loader
          .load("userAmount")
          .load("userAmount")
          .load("userAccounts")
          .load("coinTransaction")
          .load("cardTransaction")
          .load("userWithdrawal");
      });
      return response.send({ message: user });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //change user status
  public async userStatus({ request, response }) {
    try {
      const data = request.body();
      const id = data.id;
      const status = data.status;
      const user = await User.findOrFail(id);
      user.banned = status;
      user?.save();
      return response.send(user);
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //calculate revenue of both cards and coin transaction
  public async revenue({ response }) {
    try {
      const card = await Database.from("card_transactions")
        .where("status", 4)
        .sum("total");

      const coin = await Database.from("coin_transactions")
        .where("status", 4)
        .sum("total");

      const total_array = coin.concat(card);
      const total = total_array.reduce(
        (accum, item) => accum + Number(item.sum),
        0
      );

      return response.send({ message: total });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //pending transaction count
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
      if (total > 0) {
        return response.send({ message: total });
      } else {
        return response.send({ message: 0 });
      }
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //weekly transaction calculation
  public async weeklyCardExchange({ response }) {
    try {
      const weeklyCard = await Database.rawQuery(
        `select * from card_transactions`
      );
      return response.send({ message: weeklyCard });
    } catch (error) {
      console.log(error);
    }
  }

  //create card rate
  public async createCardRate({ request, response }) {
    const data = schema.create({
      name: schema.string({}, [rules.required()]),
      rate: schema.number([rules.required()])
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const card = new CardType();
      card.card_id = request.body().id
      card.name = payload.name
      card.rate = payload.rate
      card.save();
      return response.send(card);
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

    //create cards
    public async card({ request, response }) {
      const data = schema.create({
        name: schema.string({}, [rules.required()]),
      });
      try {
        const payload = await request.validate({
          schema: data,
          messages: {
            required: "This field is required",
          },
        });
        const card = new Card();
        (card.name = payload.name), card.save();
        return response.send(card);
      } catch (error) {
        console.log(error);
        return response.badRequest(error);
      }
    }

  //update cards
  public async updateCard({ request, response }) {
    const data = schema.create({
      name: schema.string({}, [rules.required()]),
      id: schema.number([rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const card = await Card.findByOrFail("id", payload.id);
      card.name = payload.name;
      card.save();
      return response.send(card);
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  //delete cards
  public async deleteCard({ request, response }) {
    const data = schema.create({
      id: schema.number([rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const card = await Card.findByOrFail("id", payload.id);
      card.delete()
      return response.send('Data Deleted');
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

   //create coin
   public async coin({ request, response }) {
    const data = schema.create({
      name: schema.string({}, [rules.required()]),
      wallet: schema.string({}, [rules.required()]),
      rate: schema.string({}, [rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const coin = new Coin();
      coin.wallet = payload.wallet,
      coin.name = payload.name,
      coin.rate = payload.rate 
      coin.save();
      return response.send(coin);
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //update coins
  public async updateCoin({ request, response }) {
    const data = schema.create({
      id: schema.number([rules.required()]),
      name: schema.string({}, [rules.required()]),
      wallet: schema.string({}, [rules.required()]),
      rate: schema.string({}, [rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const coin = await Coin.findByOrFail("id", payload.id);
      coin.name = payload.wallet,
      coin.rate = payload.name,
      coin.wallet = payload.rate,
      await coin.save();
      return response.send(coin);
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //delete cards
  public async deleteCoin({ request, response }) {
    const data = schema.create({
      id: schema.number([rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });
      const coin = await Coin.findByOrFail("id", payload.id);
      coin.delete()
      return response.send('Deleted');
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  // fetch cards and children rate
  public async cardRate({ response }) {
    try {
      const data = await Card.query().preload("cardTypes");
      return response.send({ message: data });
    } catch (error) {
      return error.response.send({ message: "something went wrong" });
    }
  }

  //get card rate
  public async getCardRate({ response }) {
    try {
      const data = await CardType.query().preload("card");
      return response.send({ message: data });
    } catch (error) {
      return error.response.send({ message: "something went wrong" });
    }
  }
  //get coin rate
  public async getCoinRate({ response }) {
    try {
      const data = await Coin.all();
      return response.send({ message: data });
    } catch (error) {
      return error.response.send({ message: "something went wrong" });
    }
  }

  //get all card transactions
  public async getCardsTransactions({ response }) {
    try {
      const transactions = await CardTransaction.query()
        .preload("status_name")
        .preload("card")
        .preload("user");
      // console.log(transactions)
      return response.send({ message: transactions });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //get all coin transactions
  public async getCoinsTransactions({ response }) {
    try {
      const transactions = await CoinTransaction.query()
        .preload("status_name")
        .preload("coin")
        .preload("user");
      // console.log(transactions)
      return response.send({ message: transactions });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //get single coin transaction
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

  //change card transaction status
  public async updateCardStatus({ request, response }) {
    try {
      const transaction = await CardTransaction.findByOrFail(
        "id",
        request.input("id")
      );
      transaction.status = request.input("status");
      transaction.save();
      return response.send({ message: transaction });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //change coin transaction status
  public async updateCoinStatus({ request, response }) {
    try {
      const transaction = await CoinTransaction.findByOrFail(
        "id",
        request.input("id")
      );
      transaction.status = request.input("status");
      transaction.save();
      return response.send({ message: transaction });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  //confirm card transaction
  public async confirmCardTransaction({ request, response }) {
    try {
      const transaction = await CardTransaction.findByOrFail(
        "id",
        request.input("id")
      );
      const wallet = await UserAmount.findByOrFail(
        "user_id",
        request.input("user_id")
      );
      transaction.completed = true;
      wallet.amount = `${transaction.total + Number(wallet.amount)}`;
      wallet.save();
      transaction.save();
      return response.send({ message: transaction });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  //confirm coin transaction
  public async confirmCoinTransaction({ request, response }) {
    try {
      const transaction = await CoinTransaction.findByOrFail(
        "id",
        request.input("id")
      );
      const wallet = await UserAmount.findByOrFail(
        "user_id",
        request.input("user_id")
      );
      transaction.completed = true;
      wallet.amount = `${transaction.total + Number(wallet.amount)}`;
      wallet.save();
      transaction.save();
      return response.send({ message: transaction });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
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

  public async allWithdrawal({ response }) {
    try {
      const allWithdrawals = await UserWithdrawal.query()
        .preload("user")
        .preload("status_name")
        .preload("userAmount");
      return response.send({ message: allWithdrawals });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async userWithdrawal({ response, params }) {
    try {
      const withdrawal = await UserWithdrawal.findByOrFail("id", params.id);
      await withdrawal?.load((loader) => {
        loader
          .load("account")
          .load("status_name")
          .load("user")
          .load("userAmount");
      });
      return response.send({ message: withdrawal });
    } catch (error) {
      console.log(error);
      return response.send({ message: "Not Found" });
    }
  }

  public async initiateWithdrawal({ request, response }) {
    try {
      const withdrawal = await UserWithdrawal.findByOrFail(
        "id",
        request.input("id")
      );
      await withdrawal?.load((loader) => {
        loader
          .load("account")
          .load("status_name")
          .load("user")
          .load("userAmount");
      });
      // console.log(Helper.paystack)
      const initializePayment = await Helper.paystack.transaction.initialize({
        name: withdrawal.user.fullname,
        account_number: withdrawal.account.account_number,
        bank_code: `0${withdrawal.account.bank_code}`,
        amount: `${Number(withdrawal.amount) * 100}`,
        email: withdrawal.user.email,
      });
      // console.log(initializePayment)
      withdrawal.receipt = initializePayment.data.reference;
      withdrawal.status = 2;
      withdrawal.save();
      return response.send(withdrawal);
    } catch (error) {
      return response.badRequest("i didn't work");
    }
  }

  public async verifyWithdrawal({ request, response }) {
    console.log("processing");
    const userWithdrawal = await UserWithdrawal.findByOrFail(
      "id",
      request.input("id")
    );
    await userWithdrawal?.load((loader) => {
      loader
        .load("account")
        .load("status_name")
        .load("user")
        .load("userAmount");
    });
    const verify = Helper.paystack.transaction.verify({
      reference: userWithdrawal.receipt,
    });
    if (verify.status == false) {
      return response.send("Something Went wrong");
    }
  }

  //subscriber
  public async getSubsriber({ response }) {
    const subscriber = await Subscriber.all();
    return response.send({ message: subscriber });
  }

  public async createNewsLetterTemplate({ request, response }) {
    const data = schema.create({
      title: schema.string({}, [rules.required()]),
      body: schema.string({}, [rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });

      const newsletter = new NewLetterTemplate();
      newsletter.title = payload.title;
      newsletter.body = payload.body;
      newsletter.save();
      return response.send({ message: newsletter });
    } catch (error) {
      return response.badRequest("You can't create now");
    }
  }

  public async editNewsLetterTemplate({ request, response, params }) {
    const data = schema.create({
      title: schema.string({}, [rules.required()]),
      body: schema.string({}, [rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });

      const newsletter = await NewLetterTemplate.findByOrFail('id', params.id);
      newsletter.title = payload.title;
      newsletter.body = payload.body;
      await newsletter.save();
      return response.send({ message: newsletter });
    } catch (error) {
      return response.badRequest("You can't create now");
    }
  }

  public async deleteNewsLetterTemplate({ response, params }) {
    try {
      const newsletter = await NewLetterTemplate.findByOrFail('id', params.id);
      await newsletter.delete();
      await newsletter.save();
      return response.send({ message: newsletter });
    } catch (error) {
      return response.badRequest("You can't create now");
    }
  }

}
