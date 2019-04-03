const express = require('express');
const router = express.Router();
const GATEKEEPER = require('../../engineering/gatekeeper');
const Problems = require('../../models/problems');

router.get('/', async (req, res) => {  
    console.log("req  ",req.query.merchandise)
    Problems.findAll().then( problems => {
        GATEKEEPER.response(res, 200, JSON.stringify(problems));
    }).catch(err => {
        console.log(err);
        GATEKEEPER.response(res, 409, JSON.stringify({ "Message": "Couldn't fetch the Clients" }))

    })

})
 
module.exports = router;