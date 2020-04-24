require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')

app.use(fileUpload());
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.set('view engine', 'jade');

const indexRouter = require('./routes/index')
app.use('/', indexRouter)


app.listen(3001)