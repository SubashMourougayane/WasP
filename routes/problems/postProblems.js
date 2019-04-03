const express = require('express');
const router = express.Router();
const GATEKEEPER = require('../../engineering/gatekeeper');
const Problems = require('../../models/problems');
const path = require('path');
const multer = require('multer');
const aws = require('aws-sdk');
const fs = require('fs');

aws.config.update({
    secretAccessKey: "NPqnGZXQ1jb59m+FrrlZS+O4Bvac8DWdzcg35LdM",
    accessKeyId: "AKIAXZNE3RTBKM4RXUPW",
})

const s3 = new aws.S3();
var fileName;

const storageStrategy = multer.diskStorage({
    destination: './uploads/problems/', 
    filename: function (req, file, cb) {
        fileName = Date.now()+ "_" + file.originalname;
        console.log("===>", fileName);
        cb(null, fileName);
    }
})
const upload = multer({
    storage: storageStrategy
}).single('problemImage');

router.post('/', async (req, res) => {
    await upload(req, res, (err) => {
        console.log(err)
        if (err) {
            //console.log(err)
            GATEKEEPER.response(res, 400, JSON.stringify({ "Message": "Image Upload Failed" }))
        } else {

            fs.readFile(`./uploads/problems/${fileName}`, async (err, data) => {
                if (err) {
                    console.log(err)
                    GATEKEEPER.response(res, 400, JSON.stringify({ "Message": "Image Upload Failed" }))
                } else {
                    var params = {
                        Bucket: 'workbench.wasp',
                        Key: `Problems/${fileName}`,
                        Body: data
                    };
                    await s3.upload(params, async (s3Err, data) => {
                        if (s3Err) {
                            console.log("S3 upload error", s3Err);
                        } else {
                            console.log("///////", data.Location);
                            await fs.unlink(`./uploads/problems/${fileName}`, function (err) {
                                if (err) {
                                    console.log("err in deleting local images");
                                } else {
                                    Problems.create({
                                        who: req.body.who,
                                        industry_belonging: req.body.industry_belonging,
                                        is_unmet_need: req.body.is_unmet_need,
                                        solution: req.body.solution,
                                        name: req.body.name,
                                        image_url: data.Location,
                                    }).then(offers => {
                                        GATEKEEPER.response(res, 200, JSON.stringify(
                                            { "Message": "Successfuly updated Offers", "data": offers }
                                        ));
                                    }).catch(err => {
                                        console.log(err)
                                        GATEKEEPER.response(res, 400, JSON.stringify(
                                            { "Message": "Unable to Update Offers! Try Again", "err": err }
                                        ));
                                    })
                                }
                            })
                        }
                    })
                }
            })


        }
    })

})

module.exports = router;