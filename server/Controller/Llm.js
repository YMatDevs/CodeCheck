import { GoogleGenerativeAI } from '@google/generative-ai';
import fs, { readFileSync } from 'fs';

import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function CodeAnalysis(filePath) {

    const fileContent = readFileSync(filePath, 'utf-8');

    const query = `
  Analyze the following code.
  Your response must be a valid JSON object following this schema:
  
  {
    "summary": "A brief overview of the code's quality.",
    "best_practices": {
      "comments": "Comments on following best practices.",
      "suggestions": "Suggestions to improve best practices."
    },
    "quality_of_code": {
      "comments": "Comments on code quality (readability, efficiency, etc.).",
      "suggestions": "Suggestions to improve code quality."
    }
  }

  Do not include any additional text, explanations, or code blocks outside the JSON object.
  \n${fileContent}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent(query);

    console.log("Output: ");

    const textResult = result.response.text();
    const cleanResult = textResult.replace(/```json\n|```/g, '').trim();

    console.log(cleanResult);

    return JSON.parse(cleanResult);

}

export default { CodeAnalysis };