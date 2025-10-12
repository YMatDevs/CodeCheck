import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs, { readFileSync } from 'fs';

// Importing Controllers
import llmController from './Controller/Llm.js';
import { buffer } from 'stream/consumers';

dotenv.config();


const app = express();
const port = process.env.PORT? process.env.PORT : 5000;

app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// const config = multer.diskStorage({
//     destination: function (req, file, callback) { callback(null, 'uploads/'); },
//     filename: function (req, file, callback) { callback(null, file.originalname + '-' + Date.now() + path.extname(file.originalname)) }
// })
const upload = multer({ storage: multer.memoryStorage() })


app.get('/', (req, res) => {
    res.render('index', {
        message: "This is the main page"
    });
});

app.post('/upload', upload.single('testfile') , async (req, res) => {
    
    const file = req.file;

    // res.render('display', {message: 'Processing. Please wait'});  
    console.log("starting function\n");  

    const output = await llmController.CodeAnalysis(file.buffer);

    // console.log("ouput: ");
  
    res.render('display', { analysis: output });
})


app.listen(port, () => { console.log(`Server Started. Listening on port ${port}`) });