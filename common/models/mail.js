'use strict';

var async   = require('async');
// var aws     = require('aws-sdk');
// // Load your AWS credentials and try to instantiate the object.
// aws.config.update({region: 'us-west-2'});
// aws.config.loadFromPath(__dirname + '/../../server/configs/aws.json');

// // Instantiate SES.
// var ses = new aws.SES();

module.exports = function(Mail) {
    // after creating the databse record, send an email
    Mail.afterRemote('create', function (ctx, newMail, next) {
        
        // this disables SSL! remove once we have our certificate!!
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        async.series([
            (seriesCB) => {
                Mail.app.models.Email.send({
                    to: 'info@mountainviewwebtech.ca',
                    from: newMail.Email,
                    subject: newMail.subject,
                    html: `
                    <ul>
                        <li>Name: <b>${newMail.name}</b></li>
                        <li>Email: <b>${newMail.email}</b></li>
                        <li>Phone: <b>${newMail.phone}</b></li>
                        <li>Subject: <b>${newMail.subject}</b></li>
                        <li>Message: <b>${newMail.message}</b></li>
                    </ul>
                    `
                }, function(err, mail) {
                    if (err) {
                        return seriesCB(err);
                    }

                    return seriesCB(null);
                });
            },
            (seriesCB) => {
                Mail.app.models.Email.send({
                    to: newMail.email,
                    from: 'info@mountainviewwebtech.ca',
                    subject: 'Thank You For Contacting Us',
                    html: `
                        This is an automated message to let you know that we have recieved your inquiry. We thank you for taking the time to write us and we will get back to you as soon as we can.
                        <br>
                        <br>
                        <img src="http://mountainviewwebtech.ca/assets/img/logo.png" alt="Mountain View Web Tech Logo"><br>
                        <b>Mountain View Web Tech</b><br>
                        7415 Shaw Ave<br>
                        Chilliwack, BC V2R 3C1
                    `
                }, function(err, mail) {
                    if (err) {
                        return seriesCB(err);
                    }

                    return seriesCB(null);
                });
            }
        ], (err) => {
            if (err) {
                return next(err);
            }
            return next(null);
        });
    });

    // // Verify email addresses.
    // Mail.verify = function(email, cb) {
    //     var params = {
    //         EmailAddress: email
    //     };
        
    //     ses.verifyEmailAddress(params, function(err, data) {
    //         if(err) {
    //             return cb(err);
    //         } 
    //         else {
    //             return cb(null, data);
    //         } 
    //     });
    // };

    // // List verified email addresses.
    // Mail.listVerified = function(cb) {
    //     ses.listVerifiedEmailAddresses(function(err, data) {
    //         if(err) {
    //             cb(err);
    //         } 
    //         else {
    //             cb(null, data);
    //         } 
    //     });
    // };

    // // Deleting verified email addresses.
    // Mail.deleteVerified = function(email, cb) {
    //     var params = {
    //         EmailAddress: email
    //     };

    //     ses.deleteVerifiedEmailAddress(params, function(err, data) {
    //         if(err) {
    //             cb(err);
    //         } 
    //         else {
    //             cb(null, data);
    //         } 
    //     });
    // };

    // // Sending RAW email including an attachment.
    // Mail.send = function(email, cb) {
    //     var params = {
    //         Destination: { /* required */
    //             ToAddresses: [
    //                 email
    //             ]
    //         },
    //         Message: { /* required */
    //             Body: { /* required */
    //                 Html: {
    //                     Data: '<p>Body Html</p>', /* required */
    //                     Charset: 'UTF-8'
    //                 },
    //                 Text: {
    //                     Data: 'Body text', /* required */
    //                     Charset: 'UTF-8'
    //                 }
    //             },
    //             Subject: { /* required */
    //                 Data: 'Subject Value', /* required */
    //                 Charset: 'UTF-8'
    //             }
    //         },
    //         Source: 'alex.divito@mountainviewwebtech.ca', /* required */
    //         ReplyToAddresses: [
    //             'alex.divito@mountainviewwebtech.ca'
    //         ],
    //         SourceArn: 'arn:aws:ses:us-west-2:577142657045:identity/alex.divito@mountainviewwebtech.ca',
    //         Tags: [
    //             {
    //             Name: 'MyName', /* required */
    //             Value: 'MyVal' /* required */
    //             },
    //             /* more items */
    //         ]
    //     };
    
    //     ses.sendEmail(params, function(err, data) {
    //         if (err) return cb(err);
    //         else     return cb(null, data);
    //     });
    // };

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

    // Mail.remoteMethod('send', {
    //     accepts: [
    //         { arg: 'email', type: 'string', required: true }
    //     ],
    //     returns: { arg: 'data', type: 'object' },
    //     http: { path: '/send', verb: 'post' }
    // });
};
