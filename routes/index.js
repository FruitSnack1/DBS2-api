const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const cryptoJs = require('crypto-js')

const auth = require('../auth-module')

let connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
})

connection.connect((err) => {
    if (err) throw err
    console.log('Database connected...')
})

router.get('/', (req, res) => {
    connection.query('SELECT * FROM test', (error, results, fields) => {
        if (error) throw error
        res.json(results)
    })
})

router.get('/sjezdovky', (req, res) => {
    connection.query('SELECT * FROM Sjezdovka', (error, results) => {
        if (error) throw error
        res.json(results)
    })
})

router.get('/vleky', (req, res) => {
    connection.query('SELECT * FROM Vleky', (error, results) => {
        if (error) throw error
        res.json(results)
    })
})

router.get('/sjezdovka/stav/:id', (req, res) => {
    connection.query(`SELECT * FROM Stavsjezdovky WHERE StavsjezdovkyID = ${req.params.id}`, (error, results) => {
        if (error) throw error
        res.json(results)
    })
})

router.post('/zakaznik', (req, res) => {
    console.log(req.body)
    req.body.password = cryptoJs.SHA256(req.body.password).toString()
    let query = `CALL addZakaznik("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.birthdate}","${req.body.username}","${req.body.password}","${req.body.street}","${req.body.cp}","${req.body.city}","${req.body.psc}",)`
    console.log(query)
    connection.query(`CALL addZakaznik("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.birthdate}","${req.body.username}","${req.body.password}","${req.body.street}",${req.body.cp},"${req.body.city}",${req.body.psc})`, (error, results) => {
        if (error) throw error
        res.json(req.body)
    })
})

router.post('/login', (req, res) => {
    connection.query(`SELECT prihlasovaciHeslo, ZakaznikID FROM Zakaznici WHERE prihlasovaciJmeno = "${req.body.username}"`, (error, results) => {
        if (error) throw error
        const hash = cryptoJs.SHA256(req.body.password).toString()
        if (hash === results[0].prihlasovaciHeslo) {
            const tokenUser = { 'id': results[0].ZakaznikID }
            const accessToken = auth.generateAccessToken(tokenUser)

            res.cookie('accessToken', accessToken);
            res.status(200).json({ message: 'logged in' })
        } else
            res.status(500).json({ message: 'wrong password' })
    })
})

router.get('/protected', auth.authenticateToken, (req, res) => {
    res.send('protected')
})



module.exports = router