import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser'



// Importing Controllers
import llmController from './Controller/Llm.js';
import { report } from 'process';

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

const flags = {
  message: null
}




// Fetching Records
async function fetchRecords()
{
  const { data, error } = await supbaseClient.from('records').select();

  if(error) console.log(error);

  if(!data) return [];

  return data;
}

app.get('/loading', (req, res) => { res.render('loading') });

app.get('/', async (req, res) => {

  const data = await fetchRecords();

  res.render('main', { reports: data, flags: flags}) 

  flags.message = null;
});

app.post('/upload', upload.array('testfile', 10) , async (req, res) => {
    
    const files = req.files;  
    const projectName = req.body.projectName;
    // const fileBuffer = files.buffer;

    const output = await llmController.CodeAnalysis(projectName, files);

    if(output.error) { flags.message = output.error; res.redirect('/'); return; }
  
    const { error } = await supbaseClient.from('records').insert({ project_name: projectName, report: output.cleanResult });

    if(error) { flags.message = "There was an error with the Database."; res.redirect('/'); return; }

    const data = fetchRecords();
    
    res.redirect('/');

})

app.get(`/reports/:id`, async (req, res) => {

  const id = req.params.id;
  

  const { data, error } = await supbaseClient.from('records').select().eq('id', id);

  // console.log("display: ", data[0].report);
  
  res.render('display', { analysis: data[0].report })
})

app.post('/api/deleteRecord', async(req, res) => {
  const id = req.body.id;

  console.log("id: ", id);

  const response = await supbaseClient.from('records').delete().eq('id', id);

  console.log("response: ", response);

  res.redirect('/');

})


app.listen(port, () => { console.log(`Server Started. Listening on port ${port}`) });