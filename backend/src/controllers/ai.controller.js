const aiService = require("../services/ai.service")


async function getReview(req, res){

    const code = req.body.code;

    if (!code) {
        return res.status(400).send("Prompt is required");
    }

    const response = await aiService(code);


    res.send(response);

}


module.exports = { getReview }