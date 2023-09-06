const nodeMailer=require("nodemailer");
exports.sendEmail=async(options)=>{
    // const transporer=nodeMailer.createTransport({
    //     host:process.env.SMPT_HOST,
    //     port:process.env.SMPT_PORT,
    //     auth:{
    //         user:process.env.SMPT_MAIL,
    //         pass:process.env.SMPT_PASSWORD,
    //     },
    //     service: process.env.SMPT_SERVICE
    // });


    const transport = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "1b7a1a12733492",
          pass: "de793349f9c310"
        }
    })

    const mailoptions={
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transport.sendMail(mailoptions)
}