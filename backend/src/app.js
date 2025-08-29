const express = require("express")
const aiRoute = require("./routes/ai.route")
const app = express()
const cors = require("cors")
const path = require('path');

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../public')));



app.use("/ai", aiRoute)


app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});



module.exports = app