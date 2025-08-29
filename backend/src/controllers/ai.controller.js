const aiService = require("../services/ai.service")


async function getReview(req, res){

    const code = req.body.code;

    if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).send("Code is required");
    }

    try {
        const response = await aiService.getAiReview(code);
        res.send(response);
    } catch (err) {
        console.error("/ai/get-review error:", err?.message || err);
        // Always return text to keep frontend rendering stable
        res.status(500).send("Failed to generate AI review. Please try again.");
    }

}


module.exports = { getReview }