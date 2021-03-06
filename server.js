require('dotenv').config(); //to use environment variables
const express = require('express');
const nodemailer = require('nodemailer'); //to send mail
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;


const PORT = process.env.PORT || 3000; //initializing port variable

const app = express();
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());

//get request
app.get('/',(req,res)=>{
    res.send('Default GET Request message')
});

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID, //Client Id
    process.env.CLIENT_SECRET, //Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken(); //to get access token

//middleware to create a transport for sending mails
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: process.env.USER_EMAIL,
         clientId: process.env.CLIENT_ID,
         clientSecret: process.env.CLIENT_SECRET,
         refreshToken: process.env.REFRESH_TOKEN,
         accessToken: accessToken
    }
});

//post request
app.post('/sendmail', (req,res)=>{
    const mailTemplate = {
        from: process.env.USER_EMAIL, //sender email address 
        to: req.body.toAddress, // receiver email addresses
        subject: req.body.subject, //subject of the email
        generateTextFromHTML: true,
        html: req.body.html //content of the email
    };
    transport.sendMail(mailTemplate, (err, res) => {
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            transport.close();
            console.log("Sent Successfully");
            res.send("Email is received");
        }
    });
    res.send('Process is executed');
});


app.listen(PORT, (req,res)=>{
    console.log(`listening on port ${PORT}`);
})


