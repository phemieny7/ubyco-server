import Env from '@ioc:Adonis/Core/Env'
import PayStack from 'paystack-api'
import nodemailer from 'nodemailer'



export const sendToken: any = (phone: string, message: string, ) => {
  const accountSid = Env.get('TWILIO_ACCOUNT_SID');
  const authToken = Env.get('TWILIO_AUTH_TOKEN');
  const num = Env.get('PHONE_NUMBER');
  const client = require('twilio')(accountSid, authToken);
  
  client.messages
    .create({
       body: message,
       from: num,
       to: phone
     })
    .then(message => console.log(message.sid));
};

export const transporter = nodemailer.createTransport({
    port: Env.get('SMTP_PORT'),
    host :Env.get('SMTP_HOST'), 
    auth:{
      user: Env.get('SMTP_USERNAME'),
      pass: Env.get('SMTP_PASSWORD')
    },
    secure: true

})

export const randomGenerator: any = (max : number, min: number) :number =>  {
  return Math. floor(Math. random() * (max - min + 1)) + min;
}

export const paystack: any = new PayStack(Env.get('PAYSTACK_TOKEN'), Env.get('NODE_ENV'))

