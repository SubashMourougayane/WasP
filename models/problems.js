const Sequelize = require('sequelize');
const DB = require('../config/database');
 
const Problems = DB.define('problem',{
    
    who:{
        type:Sequelize.STRING
    },
    industry_belonging:{
        type:Sequelize.STRING,
    },
    is_unmet_need:{
        type:Sequelize.STRING
    },
    solution:{
        type:Sequelize.STRING
    },
    name:{
        type:Sequelize.STRING
    },
    image_url:{
        type:Sequelize.STRING
    },
   
})

module.exports = Problems;