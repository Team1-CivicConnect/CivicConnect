const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.categorize = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        const prompt = `You are a civic issue classifier. Given the following issue title and description, 
return ONLY a JSON object (no explanation, no markdown):
{
  "category": one of [pothole, street_light, garbage, water_leak, fallen_tree, encroachment, sewage, road_damage, noise, other],
  "confidence": float 0-1,
  "priority": one of [low, medium, high, critical],
  "priorityScore": integer 0-100,
  "tags": array of 2-4 relevant string tags,
  "reasoning": one sentence explanation
}

Priority guidelines:
- critical (80-100): safety hazard, blocks traffic, flood risk
- high (60-79): major inconvenience, affects many people
- medium (40-59): moderate issue, limited impact
- low (0-39): minor cosmetic issue

Title: ${title}
Description: ${description}`;

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
        });

        const aiRes = msg.content[0].text;
        const parsed = JSON.parse(aiRes.trim());
        res.status(200).json(parsed);
    } catch (error) {
        console.error("AI Categorize Error", error);
        next(new Error("Failed to categorize issue using AI"));
    }
};

exports.checkDuplicate = async (req, res, next) => {
    try {
        const { title, description, address, existingIssues } = req.body;
        // In a real app, existingIssues would be queried from MongoDB 2dsphere near `location`.
        if (!existingIssues || existingIssues.length === 0) {
            return res.status(200).json({ isDuplicate: false });
        }

        const existingJson = JSON.stringify(existingIssues);

        const prompt = `You are a duplicate issue detector for a civic complaint system.
Compare the NEW issue with each EXISTING issue and determine if it's a duplicate.
Return ONLY JSON:
{
  "isDuplicate": boolean,
  "duplicateOf": "issue_id or null",
  "similarity": float 0-1,
  "reason": "one sentence"
}

NEW ISSUE:
Title: ${title}
Description: ${description}
Location: ${address}

EXISTING ISSUES:
${existingJson}`;

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
        });

        const parsed = JSON.parse(msg.content[0].text.trim());
        res.status(200).json(parsed);
    } catch (error) {
        console.error("AI Check Duplicate Error", error);
        next(new Error("Failed to check duplicate using AI"));
    }
};

exports.search = async (req, res, next) => {
    try {
        const { query } = req.body;
        const prompt = `Convert this natural language civic issue search query into MongoDB filter parameters.
Return ONLY JSON:
{
  "category": "string or null",
  "area": "string or null",
  "status": "string or null",
  "keywords": ["array of search keywords"],
  "interpretation": "one sentence describing what user is searching for"
}

Query: ${query}`;

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
        });

        const parsed = JSON.parse(msg.content[0].text.trim());
        res.status(200).json(parsed);
    } catch (error) {
        console.error("AI Search Error", error);
        next(new Error("Failed to perform AI natural language search"));
    }
};
