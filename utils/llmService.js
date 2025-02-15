const dotenv = require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateContent = async (note) => {
    try {
        const prompt = `Extract actionable medical steps from this doctor note and return ONLY JSON format:
        {
            "checklist": [...], 
            "plan": [...]
        }
        Do not provide medical advice or override the note. 
        Doctor Note: ${note}`;

        const result = await model.generateContent(prompt);
        const response = await result.response; 

        // Extract raw text from the response
        let text = response.candidates[0].content.parts[0].text;

        // Remove potential Markdown formatting (like ```json ... ```)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Parse JSON
        const jsonOutput = JSON.parse(text);
        
        console.log(jsonOutput); 
        return jsonOutput; // Return JSON
    } catch (err) {
        console.error("LLM Error:", err);
        throw new Error("Failed to process note with AI");
    }
};

module.exports = generateContent;
