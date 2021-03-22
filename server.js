require('dotenv').config()
const express = require('express');

//in memory Db, Lets use loki Js  https://github.com/techfort/LokiJS
const loki = require('lokijs');
const app = express();
const port = process.env.PORT || 3000;
const helmet = require("helmet");
const cors = require('cors');

const convertRoute = require('./routes/convertRoutes');
const convertCtrl = require('./controllers/convertCtrl');

const middleware = require('./middlewares/cache');

// Parse JSON bodies for this app.
app.use(express.json());

//use helmet for security 
app.use(helmet());
//enable cors
app.use(cors());

//Init database 
var db = new loki('paladins.db');

//initialize the collections 

 convertCtrl.databaseInitialize(db);

convertCtrl.getInitialRatesandSavetoDB(db);


app.use('/convert',middleware.cachingMiddleware, convertRoute);
app.get('/', (req,res,next) => {
    
    res.send('Hello Paladins.')

})

app.get('/rates', (req,res,next) => {
  
    convertCtrl.getInitialRatesandSavetoDB(db);
    res.json({
       status:'Success',
       data:convertCtrl.viewDatabase(db)
       
    })

})



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})