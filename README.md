# Currency Converter

This application uses https://fixer.io/

Lokijs is used for in memory database for custom caching 

## Installation



```bash
npm install
npm run start
```
### Modules used
```
"dependencies": {
    "axios": "^0.21.1",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-cache-middleware": "^1.0.1",
    "helmet": "^4.4.1",
    "lokijs": "^1.5.11",
    "moment": "^2.29.1"
  }
```

## Usage endpoints


```
http://localhost:3000/convert
```

### body
```
{
	"fromCurrency": "LKR",
	"amount": 11825.94895,
	"toCurrency": "EUR"
}

```

### Response

```
{
    "status": "Success",
    "data": {
        "amount": 49.96741688676973,
        "currency": "EUR"
    }
}

```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.



