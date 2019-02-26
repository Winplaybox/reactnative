const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = {
    uploadBufferToS3: function (fileData, fileName, err, success) {
        console.log("upload file " + fileName);

        var params = {
            Body: fileData,
            Bucket: process.env.S3_BUCKET,
            Key: `uploads/${fileName}`,
            //ContentEncoding: "utf8",
            ContentType: "image/jpeg"
        };
        s3.putObject(params, (error, data) => {
            if (error) {
                console.log(error);
                err();
            }
            else {
                console.log(data);
                success();
            }
        });
    }
}
