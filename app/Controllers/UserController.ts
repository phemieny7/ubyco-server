// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import User from 'App/Models/User'
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import cloudinary from '@ioc:Adonis/Addons/Cloudinary'
import Application from "@ioc:Adonis/Core/Application";
import * as Helper from "../common";
import Card from "App/Models/Card";
import UserAmount from "App/Models/UserAmount";
import UserWithdrawal from "App/Models/UserWithdrawal";
import Subscriber from "App/Models/Subscriber";

import Coin from "App/Models/Coin";

// import UserAccount from 'App/Models/UserAccount'
// import { Response } from '@adonisjs/http-server/build/standalone';

export default class UsersController {
  public async getProfile({ response, auth }) {
    try {
      const user = await auth.user;
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
    } catch(error) {
      return response.badRequest({ error });
    }
  }

  public async updateProfile({ request, response, auth }) {
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
      const user = await auth.user;
      const file = request.file('picture')
      //Upload to tmp folder
      if (file) {
        await cloudinary.upload(file, file.clientName)
        user.picture = file.clientName
      }
      user.phone = payload.phone;
      user.email = payload.email;
      user.fullname = payload.fullname;
       
      let name = payload.fullname.split(" ");
      //update paystack user detail to match on app
      await Helper.paystack.customer.update ({
        id: user.customer_id,
        first_name: name[0],
        last_name: name[1],
        email: payload.email,
        phone: payload.phone,
      });

      user.save();
      return response.send({ message: user });
    } catch (error) {
      console.log(error)
      return response.badRequest({ error });
    }
  }

  public async getPicture({ params, response }) {
    try {
      const data = await cloudinary.show(params.filename)
      return response.send(data);
    } catch (error) {
      return response.badRequest({ error });
    }
  }

  public async getAccount({ auth, response }) {
    try {
      const user = await auth.user;
      await user?.load("userAccounts");
      return response.send({ message: user.userAccounts });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async getAccountName({ request, response }) {
    const data = schema.create({
      bank_code: schema.string({}, [rules.required()]),
      account_number: schema.string({}, [rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });
      const name = await Helper.paystack.verification.resolveAccount({
        account_number: payload.account_number,
        bank_code: payload.bank_code,
      });
      return response.send({ message: name.body.data.account_name });
    } catch (error) {
      return response.badRequest({ message: error });
    }
  }

  public async listBanks({ response }) {
    try {
      const bank = await Helper.paystack.misc.list_banks({
        country: "nigeria",
      });
      return response.send({ message: bank.data });
    } catch (error) {
      console.log(error);
      return response.badRequest({ error });
    }
  }

  public async card({ response }) {
    try {
      const card = await Card.query().preload("cardTypes");
      return response.send({ message: card });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async coin({ response }) {
    try {
      const coin = await Coin.all();
      return response.send({ message: coin });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async cardType({ request, response }) {
    const data = schema.create({
      name: schema.string(),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });
      const card: any = await Card.findBy("name", payload.name);
      await card?.load("cardTypes");
      return response.send({ message: card?.cardTypes });
    } catch (error) {
      console.log(error);
      return response.badRequest(error);
    }
  }

  public async rateCalculator({ request, response }) {
    const data = schema.create({
      id: schema.number([rules.required()]),
      amount: schema.number([rules.required()]),
      card_id: schema.number([rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });
      const card: any = await Card.findBy("id", payload.id);
      await card.load("cardTypes", (cardQuery: any) => {
        cardQuery.where("id", payload.card_id);
      });
      let rate;
      card.cardTypes.forEach((card: any) => {
        rate = card.$attributes.rate;
      });

      return response.send({ message: Number(rate * payload.amount) });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async addAccount({ auth, request, response }) {
    const data = schema.create({
      bank_code: schema.string({}, [rules.required()]),
      account_number: schema.string({}, [rules.required()]),
      account_name: schema.string({}, [rules.required()]),
      bank: schema.string({}, [rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });
      const user = await auth.user;
      await user?.load("userAccounts");

      if (user.userAccounts.length === 2) {
        return response.send({ message: "Account limit exceeded" });
      }
      await user.related("userAccounts").create({
        bank_code: payload.bank_code,
        account_number: payload.account_number,
        account_name: payload.account_name,
        bank: payload.bank,
      });
      return response.send({ message: "Account Successfully added" });
    } catch (error) {
      console.log(error);
      response.badRequest(error);
    }
  }

  public async withdraw({ auth, request, response }) {
    const data = schema.create({
      amount: schema.number([rules.required()]),

      bank: schema.string({}, [rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
        },
      });
      const user = await auth.user;
      const wallet = await UserAmount.findByOrFail("user_id", user.id);
      if (payload.amount > wallet.amount) {
        return response.badRequest({ message: `Insufficient Amount` });
      }
      if (payload.amount < 2000) {
        return response.badRequest({
          message: `Kindly increase your witdrawal funds`,
        });
      }
      const withdraw = new UserWithdrawal();
      withdraw.user_id = user.id;
      (withdraw.bank = payload.bank),
        (withdraw.amount = payload.amount),
        withdraw.save();
      return response.send({ message: "withdraw successfull" });
    } catch (error) {
      return response.badRequest({ message: error });
    }
  }

  public async newSubscriber({ request, response }) {
    const data = schema.create({
      name: schema.string({}, [rules.required()]),
      email: schema.string({}, [rules.required()]),
    });

    try {
        const payload = await request.validate({
            schema: data,
            messages: {
              required: "The {{ field }} is required",
            },
          });
    
          const exsitingSubscriber = await Subscriber.findByOrFail("email", payload.email);
          if(exsitingSubscriber){
            return response.badRequest({
                message: `You are already on our mailing list`,
              });
          }
          const subscribe = new Subscriber()
          subscribe.name = payload.name
          subscribe.email = payload.email
          subscribe.save()
          return response.send({ message: "Welcome on board" });
    } catch (error) {
        return response.badRequest({ message: error });
    }
  }

  public async deleteSubscriber({params, response}){
      try {
          const user = await Subscriber.findByOrFail('id', params.id)
          await user.delete()
          user.save()
          return response.send({ message: "It so sad to see you goo" });
      } catch (error) {
          return response.badRequest({ message: error });
      }
  }
}
