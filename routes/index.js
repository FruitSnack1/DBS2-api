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
    res.render('index')
})

router.get('/registrace', (req, res) => {
    res.render('registrace')
})

router.get('/login', (req, res) => {
    res.render('login2')
})

router.get('/', (req, res) => {
    connection.query('SELECT * FROM test', (error, results, fields) => {
        if (error) return console.log(error)
        res.json(results)
    })
})

router.get('/sjezdovky', (req, res) => {
    connection.query('SELECT * FROM Sjezdovky s LEFT JOIN Stavysjezdovek ss ON s.SjezdovkaID = ss.SjezdovkaID', (error, results) => {
        if (error) return console.log(error)
        results.map(sjezdovka => {
            sjezdovka.Otevrenado = sjezdovka.Otevrenado.substring(0, 5)
            sjezdovka.Otevrenaod = sjezdovka.Otevrenaod.substring(0, 5)
        })
        console.log(JSON.parse(JSON.stringify(results)))
        results = JSON.parse(JSON.stringify(results))
        res.render('sjezdovky', { sjezdovky: results })
    })
})

router.get('/vleky', (req, res) => {
    connection.query('SELECT * FROM Vleky', (error, results) => {
        if (error) return console.log(error)
        res.json(results)
    })
})

router.get('/sjezdovka/stav/:id', (req, res) => {
    connection.query(`SELECT * FROM Stavysjezdovek WHERE StavsjezdovkyID = ${req.params.id}`, (error, results) => {
        if (error) return console.log(error)
        res.json(results)
    })
})

router.post('/zakaznik', (req, res) => {
    console.log(req.body.birthdate)
    req.body.password = cryptoJs.SHA256(req.body.password).toString()
    connection.query(`CALL addZakaznik("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.birthdate}","${req.body.username}","${req.body.password}","${req.body.street}",${req.body.cp},"${req.body.city}",${req.body.psc})`, (error, results) => {
        if (error) return console.log(error)
        res.render('login')
    })
})

router.post('/login', (req, res) => {
    connection.query(`SELECT prihlasovaciHeslo, ZakaznikID FROM Zakaznici WHERE prihlasovaciJmeno = "${req.body.username}"`, (error, results) => {
        if (error) return console.log(error)
        const hash = cryptoJs.SHA256(req.body.password).toString()
        if (hash === results[0].prihlasovaciHeslo) {
            const tokenUser = { 'id': results[0].ZakaznikID }
            const accessToken = auth.generateAccessToken(tokenUser)

            res.cookie('accessToken', accessToken);
            res.render('home')
        } else
            res.status(500).json({ message: 'wrong password' })
    })
})

router.get('/protected', auth.authenticateToken, (req, res) => {
    res.send('protected')
})

router.get('/image', (req, res) => {
    res.render('image')
})

router.post('/image', (req, res) => {
    console.log(req.files)
    res.send('cc')

})



module.exports = router