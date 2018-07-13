const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        // bucket doesn't have idea of folder, but we could mimic the concept of folders
        // by adding user id and slash

        // use key as a imageUrl saved in mongoDB.
        // in the future if we migrate our database we can still have this
        // relative path
        const key = `${req.user.id}/${uuid()}.jpeg`;
        s3.getSignedUrl(
            'putObject',
            {
                Bucket: 'bucket name created on AWS',
                ContentType: 'image/jpeg',
                Key: key
            },
            (err, url) => {
                res.send({key, url});
            }
        );
    });
};
