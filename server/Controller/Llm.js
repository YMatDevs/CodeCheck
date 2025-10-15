import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

import dotenv from 'dotenv';
import { error } from 'console';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);


const allowedExtensions = new Set([
    // Web Development (JavaScript Ecosystem)
    '.js',      // JavaScript
    '.jsx',     // JavaScript XML (React)
    '.ts',      // TypeScript
    '.tsx',     // TypeScript XML (React)
    '.mjs',     // ECMAScript Module
    '.cjs',     // CommonJS Module
    '.vue',     // Vue.js Single File Component
    '.svelte',  // Svelte Component
    '.astro',   // Astro Component

    // Web Development (HTML/CSS)
    '.html',    // HyperText Markup Language
    '.htm',     // HyperText Markup Language (alternative)
    '.css',     // Cascading Style Sheets
    '.scss',    // Sassy CSS (Sass)
    '.sass',    // Syntactically Awesome Style Sheets (Sass)
    '.less',    // Leaner Style Sheets

    // General Purpose & Backend
    '.py',      // Python
    '.java',    // Java
    '.kt',      // Kotlin
    '.kts',     // Kotlin Script
    '.scala',   // Scala
    '.groovy',  // Groovy
    '.cs',      // C#
    '.go',      // Go
    '.rs',      // Rust
    '.rb',      // Ruby
    '.php',     // PHP
    '.phtml',   // PHP HTML
    '.swift',   // Swift
    '.dart',    // Dart
    '.lua',     // Lua
    '.pl',      // Perl
    '.pm',      // Perl Module
    
    // Systems Programming (C/C++)
    '.c',       // C
    '.h',       // C/C++ Header
    '.cpp',     // C++
    '.hpp',     // C++ Header
    '.cxx',     // C++ (alternative)
    '.hxx',     // C++ Header (alternative)
    '.cc',      // C++ (alternative)
    '.hh',      // C++ Header (alternative)

    // Data Science & Machine Learning
    '.ipynb',   // Jupyter Notebook
    '.r',       // R
    '.rmd',     // R Markdown
    '.jl',      // Julia
    '.m',       // MATLAB / Objective-C
    '.sql',     // Structured Query Language

    // Functional Programming
    '.hs',      // Haskell
    '.lhs',     // Literate Haskell
    '.elm',     // Elm
    '.fs',      // F#
    '.fsx',     // F# Script
    '.fsi',     // F# Interface
    '.clj',     // Clojure
    '.cljs',    // ClojureScript
    '.cljc',    // Clojure/ClojureScript
    '.erl',     // Erlang
    '.ex',      // Elixir
    '.exs',     // Elixir Script
    '.lisp',    // Lisp
    '.rkt',     // Racket
    '.ml',      // OCaml
    '.mli',     // OCaml Interface
    
    // Scripting & Shell
    '.sh',      // Shell Script
    '.bash',    // Bash Script
    '.zsh',     // Zsh Script
    '.ps1',     // PowerShell Script
    '.bat',     // Windows Batch File
    '.cmd',     // Windows Command Script
    
    // Configuration & Data Formats
    '.json',    // JavaScript Object Notation
    '.jsonc',   // JSON with Comments
    '.yaml',    // YAML Ain't Markup Language
    '.yml',     // YAML (alternative)
    '.xml',     // eXtensible Markup Language
    '.toml',    // Tom's Obvious, Minimal Language
    '.ini',     // Initialization File
    '.env',     // Environment Variables
    '.cfg',     // Configuration File
    '.conf',    // Configuration File
    '.md',      // Markdown
    
    // Build & Tooling
    '.dockerfile', // Dockerfile
    '.gitignore',  // Git Ignore File
    '.gradle',     // Gradle Script
    '.cmake',      // CMake File
    'Makefile',    // Makefile (often has no extension)
    
    // Shader Languages
    '.glsl',    // OpenGL Shading Language
    '.frag',    // Fragment Shader
    '.vert',    // Vertex Shader
    '.hlsl',    // High-Level Shading Language
    '.wgsl',    // WebGPU Shading Language
    
    // Other Niche/System Languages
    '.asm',     // Assembly Language
    '.s',       // Assembly Language
    '.zig',     // Zig
    '.nim',     // Nim
    '.cr',      // Crystal
    '.v',       // V
    '.pas',     // Pascal
]);

const getQuery = (fileContent) => {

return `

        You will analyze a multi-file codebase. The combined content of multiple related files is provided below.

        Your task:
        1. Understand how the project works as a whole.
        2. Identify relationships and flow of control between files.
        3. Provide constructive, technically accurate feedback for both the entire project and each file individually.

        Note: You do not need to give very long answers, you can give answers to the point. If the file content is small in size then you can give answer in more detail

        Your response must be a single valid JSON object that follows this exact schema:

        {
          "summary": "A concise overview of the project's purpose and functionality.",
          "flow": "Explain the flow of control between files and how they work together to achieve the overall functionality.",
          "project_comments": "General feedback about the project's structure, maintainability, scalability, and overall quality.",
          "files": [
            {
              "filename": "Name of the file",
              "summary": "A brief description of this files purpose and role within the project.",
              "comments": "Detailed comments and suggestions about this files code quality, maintainability, readability, and logical structure. Mention any issues or strengths you notice.",
              "best_practices": "Suggest best practices or improvements specific to this file (naming conventions, modularity, error handling, etc.)."
            }
          ]
        }

        Rules:
        - Your output must be *strictly valid JSON (no code blocks, explanations, or extra text).
        - If you mention code, do not wrap it in markdown fences.
        - Ensure the structure strictly matches the schema above.

        Now analyze the following files:

        ${fileContent}
        `;

}


async function CodeAnalysis(projectName, files) {

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const allContent = files
        .filter(file => {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            return allowedExtensions.has(fileExtension);
        })
        .map(file => {
            const fileContent = file.buffer.toString('utf-8');
            return `File Name: ${file.originalname}\nFile Content:\n${fileContent}`;
        })
        .join("\n\n---\n\n"); 

    let answer = { cleanResult: {}, error: null } 

    
    if (!allContent) {
        console.log("No valid code files found to analyze.");
        answer.error = "No valid code files found to analyze.";
        return answer;
    }


    const result = await model.generateContent(getQuery(allContent));




    const textResult = result.response.text();
    const cleanResult = textResult.replace(/```json\n|```/g, '').trim();
    answer.cleanResult = JSON.parse(cleanResult);

    return answer;
}

export default { CodeAnalysis };