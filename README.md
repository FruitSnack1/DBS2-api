# DBS2-api
## Požadavky
[Node.js](https://nodejs.org/en/) >= 12.15
## Instalace
Stáhněte repozitář
```
git clone https://github.com/FruitSnack1/DBS2-api.git
```
Nainstalujte všechny potřebné knihovny
```
npm install
```
Přidejte do kořenového adresáře soubor `.env`a nastavte připojení k Mysql Databázi
```
HOST=db_host
PORT=db_port
USER=db_user
PASSWORD=db_password
DB=db_name
ACCESS_TOKEN_SECRET=jwt_secret
```
## Spuštění
Pro spuštění
```
node app.js
```
Při správném nastavení připojení databáze vypíše konzole `Databse connected...`

## API
Přidání nového zákazníka

`POST localhost:3001/zakaznik`
```js
{
    "firstname": String,
    "lastname": String,
    "email": String,
    "phone": String,
    "birthdate": String,
    "username": String,
    "password": String,
    "street": String,
    "cp": Number,
    "city": String,
    "psc": Number
}
```

Přihlášení

`POST localhost:3001/login`
```js
{
    "username": String,
    "password": String
}
```
