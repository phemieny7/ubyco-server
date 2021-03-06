// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import CoinTransaction from "App/Models/CoinTransaction";
import Coin from "App/Models/Coin";
import cloudinary from '@ioc:Adonis/Addons/Cloudinary'

export default class BitcoinsController {
  public async intiateTrade({ request, response, auth }) {
    console.log(request)
    const data = schema.create({
      coin_id: schema.number([rules.required()]),
      amount: schema.string({}, [rules.required()]),
      // comment: schema.string({}, [rules.required()]),
    });

    const payload = await request.validate({
      schema: data,
      messages: {
        required: "The {{ field }} is required",
      },
    });
    try {
      const user = await auth.user;
      const coin: any = await Coin.findBy("id", payload.coin_id);
      const rate = await coin.rate;

      const coinReceipt = request.file("receipt", {
        size: "10mb",
        extnames: ["jpg", "png"],
      });
     await cloudinary.upload(coinReceipt, coinReceipt.clientName)
     
    //  console.log(request)
     
      const transaction = await user.related("coinTransaction").create({
        coin_id: payload.coin_id,
        comments: request.requestBody.comment,
        amount: payload.amount,
        receipt: coinReceipt.clientName,
        rate,
        total: Number(payload.amount * rate),
      });
      return response.send({ message: transaction });
    } catch (error) {
      console.log(error);
    }
  }

  public async getAllTrade({ response, auth }) {
    try {
      const user = auth.user;
      const trades = await CoinTransaction.query()
        .where("user_id", user.id)
        .preload("status_name")
        .preload("user")
        .preload("coin");
      return response.send({ message: trades });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async getTrade({ params, response }) {
    try {
      const transaction = await CoinTransaction.findBy("id", params.id);
      await transaction?.load((loader) => {
        loader.load("coin").load("status_name").load("user");
      });

      return response.send({ message: transaction });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  public async getTradeBy({ params, response }) {
    try {
      const status = params.id;
      const trades = await CoinTransaction.query()
        .where("status", status)
        .preload("status_name")
        .preload("user")
        .preload("coin");
      return response.send({ message: trades });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }
}
