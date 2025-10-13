import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import admin from "firebase-admin";
import serviceAccount from './firbase-privateKey.json' with { type: "json" };
import cookieParser from 'cookie-parser'



// Importing Controllers
import llmController from './Controller/Llm.js';

dotenv.config();

// Application Constants
const app = express();
const port = process.env.PORT? process.env.PORT : 5000;
const supbaseUrl =  process.env.SUPBASE_PROJECT_URL;
const supbaseKey = process.env.SUPBASE_API_KEY;
const supbaseClient = createClient(supbaseUrl, supbaseKey);
const upload = multer({ storage: multer.memoryStorage() })


// Setting View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serving Static files
app.use(express.static('public'))

// Initialize Firebase
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Auth Function
function checkSession(req, res, next) {
  const sessionCookie = req.cookies?.session;
  if (!sessionCookie) return res.redirect("/auth"); 

  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(decodedClaims => {
      req.user = decodedClaims;
      next();
    })
    .catch(err => {
      console.log("Unauthorized:", err);
      res.redirect("/auth"); 
    });
}
app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body?.idToken;

  if (!idToken) return res.status(400).json({ error: "No ID token provided" });

  try {
    const expiresIn = 60 * 60 * 2 * 1000; // 2 hours
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, { maxAge: expiresIn, httpOnly: true });
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Failed to create session" });
  }
});


app.get("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/auth");
});

app.get('/auth', (req, res) => res.render('auth'));

app.get('/', checkSession, (req, res) => res.render('main') );

app.post('/upload', checkSession, upload.single('testfile') , async (req, res) => {
    
    const file = req.file;
    const fileBuffer = file.buffer;
    const fileName = `${file.originalname}`;

    const { data, error } = await supbaseClient.storage.from('CodeBucket').upload(`${fileName}`, { upsert: true, contentType: file.mimetype });
    if(error) throw error;

    // const output = await llmController.CodeAnalysis(file.buffer);

    // console.log("ouput: ");
  
    // res.render('display', { analysis: output });

    res.render('main');
})


app.listen(port, () => { console.log(`Server Started. Listening on port ${port}`) });