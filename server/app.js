import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';

dotenv.config();


const app = express();
const port = process.env.PORT? process.env.PORT : 5000;
const upload = multer({ dest: 'uploads/'})

app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.render('index', {
        message: "This is the main page"
    });
});

app.post('/upload', upload.single('testfile') , (req, res) => {
    
    const file = req.file;

    res.render('display', {message: 'Processing. Please wait'});
})


app.listen(port, () => { console.log(`Server Started. Listening on port ${port}`) });