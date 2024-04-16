const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3500;


// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
// npm i cors
// confgurating CORS-> only done here you can also leave it like app.use(cors());
const whitelist = ['https://www.yoursite.com', 'http://127.0.0.1:5500', 'http://localhost:3500'];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data
// in other words, form data:  
// ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware to convert into json format 
app.use(express.json());

//serve static files inside public folder
app.use(express.static(path.join(__dirname, '/public')));



app.get('^/$|/index(.html)?', (req, res) => { 
    //send index file for localhost:3500 and localhost:3500/index.html
    //(.html)?-->makes .html in localhost:3500/index.html optional

    //res.sendFile('./views/index.html', { root: __dirname });
    //OR
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get('/old-page(.html)?', (req, res) => {
    res.redirect(301, '/new-page.html'); //302 by default
});


//ROUTING IN A DIFFERENT WAY

//routes folder contains routers for each route that we are handling
//to give custom 404 for subdir routes also
//earlier custom 404 was only available for routes inside views folder
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/subdir', express.static(path.join(__dirname, '/public')));

// ROUTES
//localhost:3500 , localhost:3500/new-page
app.use('/', require('./routes/root'));

//localhost:3500/subdir and localhost:3500/subdir/test
app.use('/subdir', require('./routes/subdir'));

//localhost:3500/employees and localhost:3500/employees/1
//no custom 404 for the employees route as we are just returning json
app.use('/employees', require('./routes/api/employees'));



// ROUTE HANDLERS
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempted to load hello.html');
    next()
}, (req, res) => {
    res.send('Hello World!');
});


// CHAINING ROUTE HANDLERS
const one = (req, res, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req, res) => {
    console.log('three');
    res.send('Finished!');
}

app.get('/chain(.html)?', [one, two, three]);

app.get('/*', (req, res) => {  //requesting a page that does not exist
    //express will send a 404 even if we do not send anything
    //but we want to send our custom 404
    //but it will not send a 404 status code as it will find the 404.html file
    //so we add status(404)
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})
//OR
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});


//express has a default built in error handler
//but for custom error handling
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));