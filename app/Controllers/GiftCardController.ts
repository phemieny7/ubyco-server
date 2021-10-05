// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import CardTransaction from "App/Models/CardTransaction";
import cloudinary from '@ioc:Adonis/Addons/Cloudinary'


// import User from 'App/Models/User'

export default class GiftCardsController {
  public async intiateTrade({ request, response, auth }) {
    const data = schema.create({
      card_type_id: schema.number([rules.required()]),
      amount: schema.string({}, [rules.required()]),
      comment: schema.string({}, [rules.required()]),
      rate: schema.string({}, [rules.required()]),
    });

    const payload = await request.validate({
      schema: data,
      messages: {
        required: "The {{ field }} is required",
      },
    });

    try {
      const user = await auth.user;
      const cards = request.files("card",{
        size: "10mb",
        extnames: ["jpg", "png"],
      });

      for (let card of cards) {
        await cloudinary.upload(card, card.clientName)
      }

      let name: any = [];
      for (let i = 0; i < cards.length; i++) {
        name.push(cards[i].clientName);
      }
      
      const transaction = new CardTransaction();
      transaction.user_id = user.id,
      transaction.card_type_id = payload.card_type_id,
      transaction.rate = payload.rate,
      transaction.amount = payload.amount,
      transaction.comments = payload.comment,
      transaction.cards = name,
      transaction.total = Number(payload.amount) * Number(payload.rate)
      transaction.save();
      return response.status(200);
    } catch (error) {
      console.log(error);
    }
  }

  public async getAllTrade({ response, auth }) {
    try {
      const user = await auth.user;
      const trades = await CardTransaction.query()
        .where("user_id", user.id)
        .preload("status_name")
        .preload("user")
        .preload("card");
      return response.send({ message: trades });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  public async getTrade({ params, response }) {
    try {
      // const user = await auth.user
      const transaction = await CardTransaction.findBy("id", params.id);
      await transaction?.load((loader) => {
        loader.load("card").load("status_name").load("user");
      });
      return response.send({ message: transaction });
    } catch (error) {
      return error;
      // return response.badRequest(error)
    }
  }

  public async getTradeBy({ params, response, auth }) {
    try {
      const user = auth.user;
      const status_id = params.id;
      await user.load("transaction", (transactionQuery) => {
        transactionQuery.where("status", status_id);
      });
      return response.send({ message: user.transaction });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }
}
