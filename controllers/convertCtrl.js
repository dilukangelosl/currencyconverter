const axios = require('axios');
const moment = require('moment');
const loki = require('lokijs');
const CACHE_TIME = 10;
let database = null;

function getFromFixerandSave(db, mode) {
    database = db;
    //call the fixer.io and fetch data
    axios.get(`http://data.fixer.io/api/latest?access_key=${process.env.API_KEY}`).then(results => {
        const data = results.data;
        if (data.success) {
            const rts = data.rates;
            const timestamp = Date.now();
            const base = data.base;
            //if its the first time, insert into database 
            if (mode == "FIRST_TIME") {
                var collection = db.getCollection("rates");
                //saving the the current data timestamp as lastdate to control the caching time.
                collection.insert(
                    {
                        name: 'lastdate',
                        value: timestamp
                    }
                );
                //saving the Base Currency
                collection.insert(
                    {
                        name: 'base',
                        value: base
                    }
                );
            } else {
                //remove all records and add the new stuff...
                db.removeCollection('rates');
                db.saveDatabase();

                //recreate the collection and add everything
                var collection = db.addCollection("rates");
                //update the datebase with the new timestamp 

                collection.insert(
                    {
                        name: 'lastdate',
                        value: timestamp
                    }
                );

                collection.insert(
                    {
                        name: 'base',
                        value: base
                    }
                );

                console.log("Timestamp Updated");
            }


            for (let key in rts) {
                collection.insert(
                    {
                        name: key,
                        value: rts[key]
                    }
                );
            }
            console.log("Data Fetched and Saved");

        } else {
            console.log("Fixer.IO Error");
        }
    }).catch(err => {
        console.log("ERROR", err.message);
    })
}

module.exports = {

    viewDatabase: (db) => {
        database = db;
        return db.getCollection('rates').find();
    },

    getDb: () => {
        return database;
    },

    databaseInitialize: (db) => {
        database = db;
        // on the first load of (non-existent database), we will have no collections so we can 
        //   detect the absence of our collections and add (and configure) them now.
        console.log("Initializing Database Collections");
        var rates = db.getCollection("rates");

        if (rates === null) {
            console.log("Rates Collection does not exsist, creating a new fresh collection");
            rates = db.addCollection("rates");

        }
    },

    getInitialRatesandSavetoDB: (db) => {
        database = db;
        // This function will check if there is already data and if the data needs to be refetched accoirding to cache control time
        console.log("Initializing data..");
        //first check the Last Date of the api call
        var rates = db.getCollection("rates");
        const res = rates.findOne({
            name: 'lastdate'
        });
        if (res == null) {
            //getting data for the first time from fixer.io
            getFromFixerandSave(db, "FIRST_TIME");


        } else {
            console.log("Data already exsists ");
            //check if the database with the last api called timestamp and check if its 24 hours old.
            //if its 24 hours, call the fixer.io again and save the values on database

            var duration = moment.duration(moment().diff(moment(res.value)));
            console.log("APi last call difference ", duration.seconds());

            if (duration.seconds() > CACHE_TIME) {
                //if the difference between time is 24 hours, refresh from api
                getFromFixerandSave(db, "UPDATE");
                console.log("Last Refresh Date", rates.findOne({
                    name: 'lastdate'
                }).value)
            }

        }





    },



    convert: (req, res, next) => {

        try {

            var rates = database.getCollection("rates");
            const base = rates.findOne({
                name: 'base'
            }).value;

            const fromCurrency = req.body.fromCurrency;
            const amount = req.body.amount;
            const toCurrency = req.body.toCurrency;

            //req.body validation

            if (
                fromCurrency == null || typeof fromCurrency == "undefined" ||
                amount == null || typeof amount == "undefined" ||
                toCurrency == null || typeof toCurrency == "undefined"
            ) {
                res.json({
                    status: "Failed",
                    message: "All Fields Require. eg: fromCurrency, amount & toCurrency "
                })
            } else {

                const fc = rates.findOne({
                    name: fromCurrency
                });

                const tc = rates.findOne({
                    name: toCurrency
                });

                //currency vallidation
                if (fc == null || tc == null) {
                    return res.json({
                        status: "Failed",
                        message: "Invalid Currency To or From "
                    })
                } else {
                    // firstconversion to base
                   
                    firstconversion = tc.value  * parseFloat(amount);
                    console.log(fc,tc,firstconversion);
                    secondconversion = firstconversion/fc.value;
                    res.json({
                        status:"Success",
                        data: {
                            "amount": secondconversion,
                            "currency": toCurrency
                        }
                        
                    })
                }




            }

        } catch (error) {
            console.log(error);
            res.json({
                statusCode: 401,
                status: "FAILED",
                data: error,
                message: "Oops, Something went wrong, Please try again later.."
            })
        }

    }


}