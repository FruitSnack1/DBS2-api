const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const cryptoJs = require('crypto-js')
var multer = require('multer')
var upload = multer({ dest: '/' })


const auth = require('../modules/auth-module.js')
console.log(process.env.USER)
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

router.get('/admin', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    res.render('admin')
})

router.get('/admin/login', (req, res) => {
    res.render('adminlogin')
})

router.get('/zamestnanci/propustit/:id', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query(`DELETE FROM Zamestnanci WHERE ZamestnanecID = ${req.params.id}`, (error, results) => {
        if (error) return console.log(error)
        res.redirect('/admin/zamestnanci')
    })
})

router.post('/adminlogin', (req, res) => {
    connection.query(`SELECT * FROM AdminUdaje`, (error, results) => {
        if (error) return console.log(error)
        const hash = cryptoJs.SHA256(req.body.password).toString()
        if (hash === results[0].password) {
            const tokenUser = {
                admin: true
            }
            const accessToken = auth.generateAccessToken(tokenUser)

            res.cookie('accessToken', accessToken);
            res.redirect('/admin')
        } else
            res.status(500).json({ message: 'wrong password' })
    })
})

router.get('/admin/zamestnanci', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Zamestnanci LEFT JOIN Adresy ON Zamestnanci.AdresaID = Adresy.AdresaID', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('zamestnanci', { zamestnanci: results })
    })
})

router.get('/admin/pridatzamestnance', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Pokladny', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('pridatzamestnance', { pokladny: results })
    })
})

router.post('/admin/pridatzamestnance', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
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

router.get('/admin/sjezdovky', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Sjezdovky', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        results.map(s => {
            s.Otevrenaod = s.Otevrenaod.substring(0, 5)
            s.Otevrenado = s.Otevrenado.substring(0, 5)
        })
        res.render('adminsjezdovky', { sjezdovky: results })
    })
})

router.get('/admin/sjezdovka/stav/:id', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query(`SELECT * FROM StavySjezdovek WHERE SjezdovkaID = ${req.params.id}`, (error, results) => {
        if (error) return console.log(error)
        console.log(results)
        results = JSON.parse(JSON.stringify(results))
        results.map(s => {
            s.Datum = s.Datum.substring(0, 10)
        })
        res.render('adminstavy', { stavy: results })
    })
})

router.get('/admin/zakaznici', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Zakaznici LEFT JOIN Adresy ON Zakaznici.AdresaID = Adresy.AdresaID', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('zakaznici', { zakaznici: results })
    })
})

router.get('/sjezdovky', auth.authenticateToken, (req, res) => {
    connection.query('SELECT * FROM Sjezdovky LEFT JOIN PosledniAktualizaceStavu ON Sjezdovky.SjezdovkaID = PosledniAktualizaceStavu.SjezdovkaID', (error, results) => {
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

router.post('/fotky', (req, res) => {
    connection.query(`INSERT INTO Obrazky VALUES (null, "img","${req.files.image.data.toString('base64')}")`, (error, results) => {
        // if (error) return console.log(error)
        res.redirect('/fotky')
    })
})

router.get('/fotky', auth.authenticateToken, (req, res) => {
    connection.query('SELECT * FROM Obrazky', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        let html = []
        for (let i = 0; i < results.length; i++) {
            const buffer = Buffer.from(results[i].data, 'base64')
            html.push(`img class="img-thumbnail img-fotka mb-5" src="data:image/png;base64,${buffer}"`)
        }
        res.render('fotky', { fotky: html })

    })
})



module.exports = router