require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')

app.use(fileUpload());
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
    //nastaveni template enginu
app.set('view engine', 'jade');

//reference na router
const indexRouter = require('./routes/index')
app.use('/', indexRouter)

//spusteni aplikace na portu 80
app.listen(80)