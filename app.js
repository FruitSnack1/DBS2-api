require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

const indexRouter = require('./routes/index')
app.use('/', indexRouter)


app.listen(3001)