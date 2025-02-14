const axios = require("axios");

async function callLLM(note) {
  const OPENAI_API_KEY = "your-api-key-here"; 

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", 
        messages: [{ role: "system", content: "Extract actionable medical steps from the note" },
                   { role: "user", content: note }],
        temperature: 0.7
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
      }
    );

    const content = response.data.choices[0].message.content;
    const parsedSteps = JSON.parse(content);

    return parsedSteps;
  } catch (error) {
    console.error("LLM Error:", error);
    throw new Error("Failed to process note with AI");
  }
}

module.exports = callLLM;
