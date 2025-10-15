import { GoogleGenerativeAI } from '@google/generative-ai';
import fs, { readFileSync } from 'fs';

import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function CodeAnalysis(fileContent) {

    // const fileContent = file.buffer;

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


    const textResult = result.response.text();
    const cleanResult = textResult.replace(/```json\n|```/g, '').trim();

  //   const cleanResult = {
  //   summary: 'The HTML code presents a simple, well-structured landing page for a game. It uses CSS for styling and provides a basic description, controls, and a download link.',
  //   best_practices: {
  //     comments: 'The code is generally well-formatted and easy to read. The use of semantic HTML elements (e.g., `<h1>`, `<h2>`, `<footer>`) is good. The CSS is contained within the `<style>` tags, which is acceptable for a small project like this, but in a larger project, an external CSS file is recommended.  The use of appropriate meta tags (e.g., `<meta charset="UTF-8">`, `<meta name="viewport" ...>`) is present.',        
  //     suggestions: 'For larger projects, move the CSS to an external file to improve maintainability and organization. Consider adding a `<meta name="description" content="...">` tag to improve SEO. Consider using a CSS framework (like Bootstrap or Tailwind) for more advanced styling and quicker development.'
  //   },
  //   quality_of_code: {
  //     comments: 'The code is readable and uses a clean structure. The CSS is well-organized, with clear selectors and properties. The use of a linear gradient for the download button creates a visually appealing effect. The use of `no-repeat`, `center center`, and `fixed` in `background` property is appropriate for a tiled background image. The color choices are good for a space-themed game landing page.',
  //     suggestions: 'While the code is good for a small landing page, consider adding comments to the CSS to explain more complex styling rules. Use more descriptive class names to improve clarity (e.g., `downloadButton` instead of `download-btn`). Consider adding a favicon for the webpage.'
  //   }
  // }


    return JSON.parse(cleanResult);
    // return cleanResult;

}

export default { CodeAnalysis };