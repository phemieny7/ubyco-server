// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
// import Mail from '@ioc:Adonis/Addons/Mail'
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
        from: "no-reply@ubycohubs.com",
        to: `${payload.email}`,
        subject: `Verify Your Email`,
        html: `<!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
              @media screen {
                @font-face {
                  font-family: "Lato";
                  font-style: normal;
                  font-weight: 400;
                  src: local("Lato Regular"), local("Lato-Regular"),
                    url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff)
                      format("woff");
                }
        
                @font-face {
                  font-family: "Lato";
                  font-style: normal;
                  font-weight: 700;
                  src: local("Lato Bold"), local("Lato-Bold"),
                    url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff)
                      format("woff");
                }
        
                @font-face {
                  font-family: "Lato";
                  font-style: italic;
                  font-weight: 400;
                  src: local("Lato Italic"), local("Lato-Italic"),
                    url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff)
                      format("woff");
                }
        
                @font-face {
                  font-family: "Lato";
                  font-style: italic;
                  font-weight: 700;
                  src: local("Lato Bold Italic"), local("Lato-BoldItalic"),
                    url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff)
                      format("woff");
                }
              }
        
              /* CLIENT-SPECIFIC STYLES */
              body,
              table,
              td,
              a {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
        
              table,
              td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
        
              img {
                -ms-interpolation-mode: bicubic;
              }
        
              /* RESET STYLES */
              img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
              }
        
              table {
                border-collapse: collapse !important;
              }
        
              body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
              }
        
              /* iOS BLUE LINKS */
              a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
              }
        
              /* MOBILE STYLES */
              @media screen and (max-width: 600px) {
                h1 {
                  font-size: 32px !important;
                  line-height: 32px !important;
                }
              }
        
              /* ANDROID CENTER FIX */
              div[style*="margin: 16px 0;"] {
                margin: 0 !important;
              }
            </style>
          </head>
        
          <body
            style="
              background-color: #f4f4f4;
              margin: 0 !important;
              padding: 0 !important;
            "
          >
            <!-- HIDDEN PREHEADER TEXT -->
            <div
              style="
                display: none;
                font-size: 1px;
                color: #fefefe;
                line-height: 1px;
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                max-height: 0px;
                max-width: 0px;
                opacity: 0;
                overflow: hidden;
              "
            >
              We're thrilled to have you here! Get ready to dive into your new account.
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <!-- LOGO -->
              <tbody>
                <tr>
                  <td bgcolor="red" align="center">
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 600px"
                    >
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            valign="top"
                            style="padding: 40px 10px 40px 10px"
                          >
                            <img />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="red" align="center" style="padding: 0px 10px 0px 10px">
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 600px"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="center"
                            valign="top"
                            style="
                              padding: 40px 20px 20px 20px;
                              border-radius: 4px 4px 0px 0px;
                              color: #111111;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 48px;
                              font-weight: 400;
                              letter-spacing: 4px;
                              line-height: 48px;
                            "
                          >
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2">
                              Welcome!
                            </h1>
                            <img
                              src="https://www.ubycohubs.com/_next/static/images/logo-e26c9b7664ba3cd0666594e443bafdd9.png"
                              width="125"
                              height="120"
                              style="display: block; border: 0px"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    bgcolor="#f4f4f4"
                    align="center"
                    style="padding: 0px 10px 0px 10px"
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 600px"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="left"
                            style="
                              padding: 20px 30px 40px 30px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <p style="margin: 0">
                              We're excited to have you get started. First, you need to
                              confirm your account. Verify using the code below.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td bgcolor="#ffffff" align="left">
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    align="center"
                                    style="padding: 20px 30px 60px 30px"
                                  >
                                    <table border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            align="center"
                                            style="border-radius: 3px"
                                            bgcolor="red"
                                          >
                                            <a
                                              href="#"
                                              style="
                                                font-size: 20px;
                                                font-family: Helvetica, Arial,
                                                  sans-serif;
                                                color: #ffffff;
                                                text-decoration: none;
                                                color: #ffffff;
                                                text-decoration: none;
                                                padding: 15px 25px;
                                                border-radius: 2px;
                                                border: 1px solid #ffa73b;
                                                display: inline-block;
                                              "
                                              >${verification_code}</a
                                            >
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <!-- COPY -->
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="left"
                            style="
                              padding: 0px 30px 0px 30px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <p style="margin: 0">
                              If that doesn't work, copy and paste the following link in
                              your browser:
                            </p>
                          </td>
                        </tr>
                        <!-- COPY -->
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="left"
                            style="
                              padding: 20px 30px 20px 30px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <p style="margin: 0">
                              <a href="#" target="_blank" style="color: red"
                                >https://ubycohubs.com/verify/${verification_code}</a
                              >
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="left"
                            style="
                              padding: 0px 30px 20px 30px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <p style="margin: 0">
                              If you have any questions, Kindly reach us using the
                              channels below.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            bgcolor="#ffffff"
                            align="left"
                            style="
                              padding: 0px 30px 40px 30px;
                              border-radius: 0px 0px 4px 4px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <p style="margin: 0">Cheers,<br />Ubycohub Team</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    bgcolor="#f4f4f4"
                    align="center"
                    style="padding: 30px 10px 0px 10px"
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 600px"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#FFECD1"
                            align="center"
                            style="
                              padding: 30px 30px 30px 30px;
                              border-radius: 4px 4px 4px 4px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 18px;
                              font-weight: 400;
                              line-height: 25px;
                            "
                          >
                            <h2
                              style="
                                font-size: 20px;
                                font-weight: 400;
                                color: #111111;
                                margin: 0;
                              "
                            >
                              Need more help?
                            </h2>
                            <p style="margin: 0">
                              <a href="#" target="_blank" style="color: red"
                                >We’re here to help you out</a
                              >
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    bgcolor="#f4f4f4"
                    align="center"
                    style="padding: 0px 10px 0px 10px"
                  >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 600px"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f4f4f4"
                            align="left"
                            style="
                              padding: 0px 30px 30px 30px;
                              color: #666666;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
                              font-size: 14px;
                              font-weight: 400;
                              line-height: 18px;
                            "
                          >
                            <br />
                            <p style="margin: 0">
                              If these emails get annoying, please feel free to
                              <a
                                href="#"
                                target="_blank"
                                style="color: #111111; font-weight: 700"
                                >unsubscribe</a
                              >.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
        `,
      };

      //Create new user
      const user = new User();
      (user.phone = payload.phone),
        (user.email = payload.email),
        (user.fullname = payload.fullname),
        (user.password = payload.password),
        (user.verification_code = verification_code);
      await user.save();
      await Helper.transporter.sendMail(mailData, (error: any) => {
        if (error) {
          console.log(error);
          return response.badRequest(error.messages);
        }
      });

      return response.status(200);
    } catch (error) {
      console.log(error);
      return response.badRequest(error.messages);
    }
  }

  public async verify({ auth, request, response }) {
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
        expiresIn: "2hours",
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
          expiresIn: "2hours",
        });
      return response.status(200).send({ message: token, user });
    } catch (error) {
      console.log(error);
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
        from: "no-reply@ubycohubs.com",
        to: `${payload.email}`,
        subject: `Reset Your Password`,
        html: `
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
        `,
      };

      await Helper.transporter.sendMail(mailData, (error: any) => {
        if (error) {
          console.log(error);
          return response.badRequest(error.messages);
        }
      });

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
