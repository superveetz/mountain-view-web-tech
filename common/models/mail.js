'use strict';
var async = require ('async');

module.exports = function(Mail) {
    // after creating the databse record, send an email
    Mail.afterRemote('create', function (ctx, newMail, next) {
        async.series([
            (seriesCB) => {
                Mail.app.models.Gmail.send({
                    to: 'mountainviewwebtech@gmail.com',
                    from: 'mountainviewwebtech@gmail.com',
                    subject: 'Note to self',
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
                Mail.app.models.Gmail.send({
                    to: newMail.email,
                    from: 'noreply@mountainviewwebtech.com',
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

    // send an email
    // Mail.submitContactForm = function(name, email, phone, subject, message, cb) {

    //     async.series([
    //         (seriesCB) => {
    //             Mail.app.models.Gmail.send({
    //                 to: 'mountainviewwebtech@gmail.com',
    //                 from: 'mountainviewwebtech@gmail.com',
    //                 subject: 'Note to self',
    //                 html: `
    //                 <ul>
    //                     <li>Name: <b>${name}</b></li>
    //                     <li>Email: <b>${email}</b></li>
    //                     <li>Phone: <b>${phone}</b></li>
    //                     <li>Subject: <b>${subject}</b></li>
    //                     <li>Message: <b>${message}</b></li>
    //                 </ul>
    //                 `
    //             }, function(err, mail) {
    //                 if (err) {
    //                     return seriesCB(err);
    //                 }

    //                 return seriesCB(null);
    //             });
    //         },
    //         (seriesCB) => {
    //             Mail.app.models.Gmail.send({
    //                 to: email,
    //                 from: 'noreply@mountainviewwebtech.com',
    //                 subject: 'Thank You For Contacting Us',
    //                 html: `
    //                     This is an automated message to let you know that we have recieved your inquiry. We thank you for taking the time to write us and we will get back to you as soon as we can.
    //                     <br>
    //                     <hr>
    //                     <img src="http://mountainviewwebtech.ca/assets/img/logo.png" alt="Mountain View Web Tech Logo"><br>
    //                     <b>Mountain View Web Tech</b><br>
    //                     7415 Shaw Ave<br>
    //                     Chilliwack, BC V2R 3C1
    //                 `
    //             }, function(err, mail) {
    //                 if (err) {
    //                     return seriesCB(err);
    //                 }

    //                 return seriesCB(null);
    //             });
    //         }
    //     ], (err) => {
    //         if (err) {
    //             return cb(err);
    //         }
    //         return cb(null, {
    //             name: name,
    //             email: email,
    //             phone: phone,
    //             subject: subject,
    //             message: message
    //         });
    //     });
    // }

    // Mail.remoteMethod('submitContactForm', {
    //     accepts: [
    //         { arg: 'name', type: 'string', required: true },
    //         { arg: 'email', type: 'string', required: true },
    //         { arg: 'phone', type: 'string', required: true },
    //         { arg: 'subject', type: 'string', required: true },
    //         { arg: 'message', type: 'string', required: true },
    //     ],
    //     returns: { arg: 'data', type: 'object' },
    //     http: { path: '/submitContactForm', verb: 'post' }
    // });
};
