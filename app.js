//de la lab12, 2 b si vezi cu indexul ce faci
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser=require('cookie-parser');
const path = require('path');
const fs = require("fs");

const app = express();

const port = 6789;

//cookies
app.use(cookieParser())
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
var cos = []
var cost = 0
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

var blacklist = []
app.get('/', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	//res.send('Hello World')
	console.log('dadadadad')
		res.render('index', { tabela:null, u:req.cookies.username});
	}
	else{
		res.end('afaaara');
	}
	
});

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	try{
		const jsonString  = fs.readFileSync("./intrebari.json");
		const listaIntrebari = JSON.parse(jsonString);
		res.render('chestionar', {intrebari: listaIntrebari, u:req.cookies.username});
	} catch(err){
		console.log(err);
		return;
	}
	}else{
		res.end('afaaara');
	}

});
app.get('/autentificare', (req,res) =>{
	if(!blacklist.includes(req.socket.remoteAddress)){
	res.render('autentificare',{u:req.cookies.username});
	}else{
		res.end('afaaara');
	}
});

app.post('/rezultat-chestionar', (req, res) => {//JSON.stringify(req.body)) am json cu raspunsurile
	if(!blacklist.includes(req.socket.remoteAddress)){
		let nrCorecte = 0;
		let i = 0;
		const jsonString  = fs.readFileSync("./intrebari.json");
		const listaIntrebari = JSON.parse(jsonString);
		var lista_rasp  =  req.body
		console.log(listaIntrebari[i]['corect'])

		for(i = 0; i < listaIntrebari.length; ++i){
			if(lista_rasp['q'+ i] == listaIntrebari[i]['corect']){
				console.log('' + i)
				nrCorecte++;
			}
		}
	
	
	res.render("rezultat-chestionar"  ,{ nrintrebari:listaIntrebari.length, nrCorecte:nrCorecte, u:req.cookies.username});
	}
	else{
		res.end('afaaara');
	}
});

app.post('/verificare-autentificare',(req,res) =>{
	if(!blacklist.includes(req.socket.remoteAddress)){
		cost = 0
		// console.log(req.body)
		// console.log(req.body['fname'])
		try{
			const jsonString  = fs.readFileSync("./utilizatori.json");
			const listaUtilizatori = JSON.parse(jsonString);

			for(let cheie of listaUtilizatori){
				if( req.body['fname'] == 'admin' && req.body['pname'] == 'admin')
				{
					console.log(req.body['fname'], " +" + req.body['pname'])
					res.cookie('admin', req.body['fname'])
					res.redirect('/admin')
					return
				}
				if(cheie.username == req.body['fname'] && cheie.password == req.body['pname'])
				{
					console.log(req.body['fname'], " +" + req.body['pname'])
					res.cookie('username',req.body['fname'])
					res.redirect('/')
					return
				}
				
			}
			res.cookie('username','Error')
					res.redirect('http://localhost:6789/autentificare')
					return
		} catch(err){
			console.log(err);
			return;
		}
	}
	else{
		res.end('afaaara');
	}
	
});
app.get('/admin', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
		res.render('admin', {u:req.cookies.admin})
	}else{
		res.end('afaaara');
		}
})
app.post('/incarca-produs', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	console.log(req.body['produs'])
	console.log(req.body['pret'])
	//${req.body['produs']},${req.body['pret']}
	let promise = new Promise(function(resolve, reject) {
	db.run(`insert into produse(nume,pret) values (?,?)`,req.body['produs'],parseInt(req.body['pret']));
	resolve();
	});
	promise.then(()=>{
		res.redirect('admin');
	})
	}
	else{
		res.end('afaaara')
	}
	
});
app.get('/de-logare', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	//res.cookie(req.cookies.Vasi, any);
	cos = []
	res.clearCookie('username');
	res.redirect('/');
	}else{
		res.end('afaaara');
	}

})

var sqlite3 = require('sqlite3');
const { resolve } = require('path');
let db = new sqlite3.Database('./cumparaturi.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
	if (err && err.code == "SQLITE_CANTOPEN") {
		//createDatabase();
		return;
		} else if (err) {
			console.log("Getting error " + err);
			exit(1);
		}
		
	});

app.get('/creare-DB', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	db.exec(`

		create table if not exists produse(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nume text not null,
			pret int not null
			);
	`);
	res.redirect('/');
		}
		else{res.end('afaaara')}
})

app.get('/insertIntoDB', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	db.exec(`insert into produse(nume, pret)
        values ('Ciment',25),
               ('Fier',45),
               ('Lemn',800),
               ('Cuie',8),
               ('Sarma',10),
               ('Polistiren',54), 
			   ('Nisip',102);`);
	res.redirect('/');
	}
	else{
		res.end('afaaara')
	}

})
app.get('/selectFromDB', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	db.all(`select *from produse`, (err, rows) => {
        rows.forEach(rows => {
			var id = rows.id
			var nume = rows.nume
			var pret = rows.pret
            console.log(rows.id + "\t" + rows.nume + "\t" + rows.pret);
        });
		res.render('index', {tabela:rows, u:req.cookies.username} );
    });
}else{
	res.end('afaaara');
}
})

app.get('/adaugare_cos', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	 	db.all(`select *from produse`, (err, rows) => {
        rows.forEach(rows => {
			var id = rows.id
			var nume = rows.nume
			var pret = rows.pret
			for(let produs of Object.keys(rows)){
				var ids = rows[produs];
				if(ids == req.query['id'])
				{
					cos.push(req.query['nume']);
				}
				
			}
			
		});
		cost = Number(cost) + Number(req.query['pret']);
			console.log(cos)
			console.log(cost)
		
    });
	res.render('index', {tabela:null, u:req.cookies.username});
}
else{
	res.end('afaaara')
}
})

app.get('/vizualizare-cos', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
		res.render('vizualizare-cos', {u:req.cookies.username, lista:cos, total:cost});
	}else{
		res.end()
	}
})

app.get('/stil.css', (req, res) => {
	if(!blacklist.includes(req.socket.remoteAddress)){
	var options = {
        root: path.join(__dirname)
    };
     
    var fileName = 'stil.css';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
}else{
	res.end('afaaara');
}
});

app.get('*', (req, res)=>{
	console.log(blacklist);
	var ip = req.socket.remoteAddress;
	blacklist.push(ip);
	(new Promise(function(resolve) {setTimeout(resolve, 2000)})).then(() => {blacklist.splice(blacklist.indexOf(ip))});
	res.end();
});

app.listen(port, () => console.log('Serverul rulează la adresa http://localhost:'));