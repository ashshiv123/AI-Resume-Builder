require("dotenv").config()
const app = require('./src/app')
const connectedToDB = require('./src/config/database')

connectedToDB();

app.listen(3000, ()=>{
    console.log("server is running on port 3000");
})

