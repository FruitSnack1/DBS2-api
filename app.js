require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(express.json())
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }))

const indexRouter = require('./routes/index')
app.use('/', indexRouter)


app.listen(3001)