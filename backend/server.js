require("dotenv").config()
const app = require("./src/app")



app.get("/", (req, res) => {
    res.send("hello wor")

})



app.listen(3000, ()=>{
    console.log("server start on port no 3000")
})