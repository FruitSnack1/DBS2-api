const express = require('express')
let router = express.Router()
let mysql = require('mysql')

let connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
})

connection.connect((err)=>{
    if (err) throw err
    console.log('Database connected...')
})

router.get('/', (req, res) => {
    connection.query('SELECT * FROM test',  (error, results, fields) =>{
        if (error) throw error
        res.json(results)
    })
})

module.exports = router