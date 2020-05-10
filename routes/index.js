//import knihoven
const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const cryptoJs = require('crypto-js')
const auth = require('../modules/auth-module.js')

//pripojeni k databazi
let connection = mysql.createPool({
    connectionLimit: 100,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
})

// connection.connect((err) => {
//     if (err) throw err
//     console.log('Database connected...')
// })

//render uvodni stranky
router.get('/', (req, res) => {
    res.render('index')
})

//odhlaseni uzivatele
router.get('/logout', (req, res) => {
    res.cookie('accessToken', 0, { maxAge: 0 });
    res.redirect('/')
})

//render admin panelu
router.get('/admin', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    res.render('admin')
})

//render prihlaseni pro admina
router.get('/admin/login', (req, res) => {
    res.render('adminlogin')
})

//smazani zamestnance podle id
router.get('/zamestnanci/propustit/:id', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query(`DELETE FROM Zamestnanci WHERE ZamestnanecID = ${req.params.id}`, (error, results) => {
        if (error) return console.log(error)
        res.redirect('/admin/zamestnanci')
    })
})

//prihlaseni admina
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

//render zamestnancu (admin pristup)
router.get('/admin/zamestnanci', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Zamestnanci LEFT JOIN Adresy ON Zamestnanci.AdresaID = Adresy.AdresaID', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('zamestnanci', { zamestnanci: results })
    })
})

//render formulare pro pridani zamestnance
router.get('/admin/pridatzamestnance', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Pokladny', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('pridatzamestnance', { pokladny: results })
    })
})

//pridani zamestnance
router.post('/admin/pridatzamestnance', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query(`CALL pridejZamestnance("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.job}","${req.body.street}",${req.body.cp},"${req.body.city}",${req.body.psc},${req.body.pokladna})`, (error, results) => {
        if (error) return console.log(error)
        res.redirect('/admin/zamestnanci')
    })
})

//render registrace uzivatele
router.get('/register', (req, res) => {
    res.render('registrace')
})

//render prihlaseni uzivatele
router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/home', auth.authenticateToken, (req, res) => {
    res.render('home', { user: req.user })
})

//sjezdovky na admin panelu
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

//sjezdovky na admin panelu
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

//zakaznici na admin panelu
router.get('/admin/zakaznici', auth.authenticateToken, auth.authenticateAdmin, (req, res) => {
    connection.query('SELECT * FROM Zakaznici LEFT JOIN Adresy ON Zakaznici.AdresaID = Adresy.AdresaID', (error, results) => {
        if (error) return console.log(error)
        results = JSON.parse(JSON.stringify(results))
        res.render('zakaznici', { zakaznici: results })
    })
})

//sjezdovky
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

//regisrace zakaznika
router.post('/zakaznik', (req, res) => {
    console.log(req.body.birthdate)
    req.body.password = cryptoJs.SHA256(req.body.password).toString()
    connection.query(`CALL pridejZakaznika("${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.phone}","${req.body.birthdate}","${req.body.username}","${req.body.password}","${req.body.street}",${req.body.cp},"${req.body.city}",${req.body.psc})`, (error, results) => {
        if (error) return console.log(error)
        res.render('login')
    })
})

//prihlaseni zakaznika
router.post('/login', (req, res) => {
    connection.query(`SELECT prihlasovaciHeslo, ZakaznikID, Jmeno FROM Zakaznici WHERE prihlasovaciJmeno = "${req.body.username}"`, (error, results) => {
        if (error) return console.log(error)
        if (results.length == 0) return res.status(500).json({ message: "user not found" })
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

router.get('/karty', auth.authenticateToken, (req, res) => {
    connection.query(`SELECT * FROM KartyZkazniku WHERE ZakaznikID = ${req.user.id}`, (error, results) => {
        if (!results)
            results = []
        results.map(result => {
            result.Platnostdo = `${result.Platnostdo.getDate()}-${result.Platnostdo.getMonth()+1}-${result.Platnostdo.getFullYear()}`
        })
        console.log(results)
        res.render('karty', { karty: results })
    })
})

router.get('/koupitkartu', auth.authenticateToken, (req, res) => {
    res.render('koupitkartu')
})

router.post('/koupitkartu', auth.authenticateToken, (req, res) => {
    const obj = new Date()
    const startDate = `${obj.getFullYear()}-${obj.getMonth()+1}-${obj.getDate()}`
    const endDate = `${obj.getFullYear()}-${obj.getMonth()+1+parseInt(req.body.duration)}-${obj.getDate()}`
    connection.query(`INSERT INTO KartyZkazniku VALUES (${req.body.duration*100}, "${endDate}", "${startDate}", null, 1,${req.user.id})`, (error, results) => {
        res.redirect('/karty')
    })
})

//pridani fotky
router.post('/fotky', auth.authenticateToken, (req, res) => {
    connection.query(`INSERT INTO Obrazky VALUES (null, "img","${req.files.image.data.toString('base64')}")`, (error, results) => {
        res.redirect('/fotky')
    })
})

//zobrazeni fotky
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