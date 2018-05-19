'use strict';

var async   = require('async');
// // Load your AWS credentials and try to instantiate the object.
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

// var awsSecrets = require('aws-secrets');

module.exports = function(Mail) {
    // Sending email
    Mail.send = function(name, email, phone, subject, body, cb) {
        // console.log('fromEmail: ', fromEmail);
        // console.log('toEmail: ', toEmail);
        // console.log('subject: ', subject);
        // console.log('body: ', body);

        const params = {
            Destination: {
                ToAddresses: ['alex@mountainviewwebtech.ca']
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data:`
                            <html>
                                <body>
                                    <p>
                                        Dear Mountain View Web Tech, <br><br>

                                        My name is ${name} with phone number: ${phone}. <br><br>

                                        ${body}
                                    </p>
                                </body>
                            </html>
                        `
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `
                            Dear Mountain View Web Tech,\r\n\r\n

                            My name is ${name} with phone number: ${phone}.\r\n\r\n

                            ${body}
                        `
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            ReplyToAddresses: [email],
            ReturnPath: "Mountain View Web Tech <alex@mountainviewwebtech.ca>",
            Source: "Mountain View Web Tech <alex@mountainviewwebtech.ca>"
        };

        var SES = new AWS.SES();
    
        // Your code goes here. 
        SES.sendEmail(params, (err, data) => {
            if (err) console.log(err, err.stack)
            else console.log(data)
            cb(err);
        });
        
    };

    // Mail.remoteMethod('verify', {
    //     accepts: [
    //         { arg: 'email', type: 'string', required: true }
    //     ],
    //     returns: { arg: 'data', type: 'object' },
    //     http: { path: '/verify', verb: 'post' }
    // });

    // Mail.remoteMethod('listVerified', {
    //     accepts: [
    //     ],
    //     returns: { arg: 'data', type: 'object' },
    //     http: { path: '/listVerified', verb: 'post' }
    // });

    // Mail.remoteMethod('deleteVerified', {
    //     accepts: [
    //         { arg: 'email', type: 'string', required: true }
    //     ],
    //     returns: { arg: 'data', type: 'object' },
    //     http: { path: '/deleteVerified', verb: 'post' }
    // });

    Mail.remoteMethod('send', {
        isStatic: true,
        accepts: [
            { arg: 'name', type: 'string', required: true },
            { arg: 'email', type: 'string', required: true },
            { arg: 'phone', type: 'string', required: true },
            { arg: 'subject', type: 'string', required: true },
            { arg: 'message', type: 'string', required: true }
        ],
        returns: { arg: 'data', type: 'object' },
        http: { path: '/send', verb: 'post' }
    });
};
