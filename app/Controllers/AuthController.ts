// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import Mail from '@ioc:Adonis/Addons/Mail'
import * as Helper from "../common";
import User from "../Models/User";

export default class AuthController {
  public async register({ request, response }) {
    // validate input
    const data = schema.create({
      fullname: schema.string({}, [rules.required()]),
      phone: schema.string({ trim: true }, [rules.required()]),
      email: schema.string({ escape: true }, [rules.required(), rules.email()]),
      password: schema.string({}, [rules.required()]),
    });

    try {
      //generate token
      const verification_code: string = Helper.randomGenerator(10000, 999999);
      //validate input
      const payload = await request.validate({
        schema: data,
        reporter: validator.reporters.api,
        messages: {
          required: "The {{ field }} is required",
          "email.unique": "email already exist",
          "phone.unique": "phone number already exist",
          email: "Invalid email input",
        },
        errors: [
          {
            code: "required",
            source: {
              pointer: "title",
            },
            //   title: 'required validation failed'
          },
        ],
      });
      // send token to phone number
      // await Helper.sendToken(payload.phone, `your Ubyco token is ${verification_code}`)
      
      const mailData = {
        from: 'no-reply@ubycohubs.com',
        to: `${payload.email}`,
        subject: `Verify Your Email`,
        html:`
        <head>
        </head>
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly;">
        <center style="width: 100%; background-color: #f1f1f1;">
    <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
    <div style="max-width: 600px; margin: 0 auto;" class="email-container">
    	<!-- BEGIN BODY -->
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      	<tr>
          <td valign="top" class="bg_white" style="padding: 1em 2.5em;">
          	<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          		<tr>
          			<td class="logo" style="text-align: center;">
			            <h1><a href="#">UBYCO HUB</a></h1>
			          </td>
          		</tr>
          	</table>
          </td>
	      </tr><!-- end tr -->
				<tr>
          <td valign="middle" class="hero hero-2 bg_white" style="padding: 4em 0;">
            <table>
            	<tr>
            		<td>
            			<div class="text" style="padding: 0 3em; text-align: center;">
            				<p>Welcome on board, your token is  ${verification_code}</p>
            			</div>
            		</td>
            	</tr>
            </table>
          </td>
	      </tr><!-- end tr  -->
        <table>
       </center
        </body>
        `
      }

      await Helper.transporter.sendMail(mailData, (error:any, info:any) => {
        if(error){
          console.log(error)
          return response.badRequest(error.messages);
        }
      })
      // await Mail.send((message) => {
      //   message
      //     .from('noreply@ubycohub.ng')
      //     .to(payload.email)
      //     .subject('Verify Account')
      //     .html(`
            
      //     `)
      // })
  

      //Create new user
      const user = new User();
      (user.phone = payload.phone),
        (user.email = payload.email),
        (user.fullname = payload.fullname),
        (user.password = payload.password),
        (user.verification_code = verification_code);
      await user.save();
      return response.status(200);
    } catch (error) {
      console.log(error)
      return response.badRequest(error.messages);
    }
  }

  public async verify({auth,request, response }) {
    const data = schema.create({
      verification_code: schema.string({}, [rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "This field is required",
        },
      });

      let user = await User.findByOrFail(
        "verification_code",
        payload.verification_code
      );

        //split the full name for paystack customer account creation
        let name = user.fullname.split(" ");

        //create user as a paystack customer
        const createCustomer = await Helper.paystack.customer.create({
          first_name: name[0],
          last_name: name[1],
          email: user.email,
          phone: user.phone,
        });

        // console.log(createCustomer)
        //add customer_code to user details for future communication
        user.customer_id = createCustomer.data.customer_code;
        //create user wallet
        await user.related("userAmount").create({
          amount: "0",
        });

        user.is_verified = true;
        //save updated user
        await user.save();
        // Generate Token

        const token: any = await auth.use("api").generate(user, {
          expiresIn: "7days",
        });
        return response.status(200).send({ message: token, user });
    } catch (error) {
       return response.badRequest(error);
    }
  }

  // public async requestToken({auth, request, response}){

  // }

  public async login({ request, response, auth }) {
    //Validate User input
    const data = schema.create({
      email: schema.string({}, [rules.required(), rules.email()]),
      password: schema.string({}, [rules.required()]),
    });
    try {
      const payload = await request.validate({
        schema: data,
        messages: {
          required: "The {{ field }} is required",
          email: "invalid email input",
        },
      });
      const user = await User.findByOrFail("email", payload.email);
      //check if user is verified
      if (!user.is_verified) {
        return response
          .status(401)
          .send({ message: "Kindly verify your account" });
      }
      if (user.banned) {
        return response
          .status(401)
          .send({ message: "you are not allowed to use the system" });
      }
      //Authenticate User
      const token: any = await auth
        .use("api")
        .attempt(payload.email, payload.password, {
          expiresIn: "7days",
        });
      return response.status(200).send({ message: token , user });
    } catch (error) {
      console.log(error)
      return response.badRequest(error);
    }
  }

   //In the end of every experience..........
  public async logout({ auth }) {
    await auth.use("api").revoke();
    return {
      revoked: true,
    };
  }

  public async forget({ request, response }) {
    //validate
    const data = schema.create({
      email: schema.string({}, [rules.required()]),
    });

    try {
      const payload = await request.validate({
        schema: data,
        message: {
          required: "The {{field}} is required",
        },
      });
      //generate token
      const verification_code = await Helper.randomGenerator(100000, 999999);

     

      //find phone if exist and update
      const user = await User.findByOrFail("email", payload.email);

       //token sent
       const mailData = {
        from: 'no-reply@ubycohubs.com',
        to: `${payload.email}`,
        subject: `Verify Your Email`,
        html:`
        <head>
        </head>
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly;">
        <center style="width: 100%; background-color: #f1f1f1;">
    <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
    <div style="max-width: 600px; margin: 0 auto;" class="email-container">
    	<!-- BEGIN BODY -->
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      	<tr>
          <td valign="top" class="bg_white" style="padding: 1em 2.5em;">
          	<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          		<tr>
          			<td class="logo" style="text-align: center;">
			            <h1><a href="#">UBYCO HUB</a></h1>
			          </td>
          		</tr>
          	</table>
          </td>
	      </tr><!-- end tr -->
				<tr>
          <td valign="middle" class="hero hero-2 bg_white" style="padding: 4em 0;">
            <table>
            	<tr>
            		<td>
            			<div class="text" style="padding: 0 3em; text-align: center;">
            				<p>Your request reset token is <strong>${verification_code}</strong></p>
            			</div>
            		</td>
            	</tr>
            </table>
          </td>
	      </tr><!-- end tr  -->
        <table>
        </center>
        </body>
        `
      }

      await Helper.transporter.sendMail(mailData, (error:any, info:any) => {
        if(error){
          console.log(error)
          return response.badRequest(error.messages);
        }
      })

      user.verification_code = verification_code;
      user.is_verified = false;
      user.save();
      return response.send({ message: "We sent you a token" });
    } catch (error) {
      return response.badRequest(error.messages);
    }
  }

  public async index({ auth, response }) {
    try {
      return response.status(200).send({ message: auth.user });
    } catch (error) {
      return response.badRequest(error.messages);
    }
  }
}
