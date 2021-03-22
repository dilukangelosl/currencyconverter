const ctrl = require('../controllers/convertCtrl');
//middle ware to check wether to pull new data or use exsising data 

module.exports = {

    cachingMiddleware : (req,res,next) => {
        console.log("Using caching middleware");
        ctrl.getInitialRatesandSavetoDB(ctrl.getDb());
        next();
    }
}