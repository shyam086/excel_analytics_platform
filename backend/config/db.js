const mongoose = require("mongoose") 

require("dotenv").config()
let db_url = process.env.DB_URL 


const db =async()=>{
    try{
        await mongoose.connect(db_url)
        console.log("Database connected successfully")
    }
    catch(err){
        console.log("Error")
    }
}

module.exports=db;
