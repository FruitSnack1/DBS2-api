const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const cryptoJs = require('crypto-js')
const cookieParser = require('cookie-parser')

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

router.get('/logout', (req, res) => {
    res.cookie('accessToken', 0, { maxAge: 0 });
    res.redirect('/')
})

router.get('/admin', (req, res) => {
    res.render('admin')
})

router.get('/admin/zamestnanci', (req, res) => {
    connection.query('SELECT * FROM Zamestnanci LEFT JOIN Adresy ON Zamestnanci.AdresaID = Adresy.AdresaID', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        console.log(results)
        res.render('zamestnanci', { zamestnanci: results })
    })
})

router.get('/admin/pridatzamestnance', (req, res) => {
    connection.query('SELECT * FROM Pokladny', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('pridatzamestnance', { pokladny: results })
    })
})

router.post('/admin/pridatzamestnance', (req, res) => {
    // res.json(req.body)
    connection.query(`CALL pridejZamestnance("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.job}","${req.body.street}",${req.body.cp},"${req.body.city}",${req.body.psc},${req.body.pokladna})`, (error, results) => {
        if (error) return console.log(error)
        res.redirect('/admin/zamestnanci')
    })
})

router.get('/register', (req, res) => {
    res.render('registrace')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/home', auth.authenticateToken, (req, res) => {
    console.log(req.user)
    res.render('home', { user: req.user })
})

router.get('/sjezdovky', auth.authenticateToken, (req, res) => {
    connection.query('SELECT * FROM Sjezdovky s LEFT JOIN StavySjezdovek ss ON s.SjezdovkaID = ss.SjezdovkaID', (error, results) => {
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
    connection.query(`SELECT * FROM StavySjezdovek WHERE StavsjezdovkyID = ${req.params.id}`, (error, results) => {
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
    connection.query(`SELECT prihlasovaciHeslo, ZakaznikID, Jmeno FROM Zakaznici WHERE prihlasovaciJmeno = "${req.body.username}"`, (error, results) => {
        if (error) return console.log(error)
        const hash = cryptoJs.SHA256(req.body.password).toString()
        if (hash === results[0].prihlasovaciHeslo) {
            const tokenUser = {
                id: results[0].ZakaznikID,
                name: results[0].Jmeno
            }
            const accessToken = auth.generateAccessToken(tokenUser)

            res.cookie('accessToken', accessToken);
            res.redirect('/home')
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