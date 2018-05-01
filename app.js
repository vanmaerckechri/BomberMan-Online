// MODULES!
let express = require('express'),
	app = express(),
	server = require('http').createServer(app),
    http = require('http'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	ent = require('ent'),
	io = require('socket.io')(http).listen(server);

app.set('port', (process.env.PORT || 1337));

server.listen(app.get('port'), function()
{
	console.log('Node app is running on port', app.get('port'));
});

app.set('view engine', 'ejs');

// MIDDLEWARES!

// Acceder aux Fichiers Nécessaires au Fonctionnement de l'Application.
app.use('/assets', express.static('public'));

// Formater les Données Importées (input, json, etc.).
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// Sessions.
app.use(session(
{
	secret: 'turlututu',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false } // true pour l'https.
}))

// Middlewares Custom.

// Messages d'Alerte.
app.use(require('./middlewares/alert'));

// ROUTES!

// Route Principale.
app.get('/', (req, res) =>
{
	req.session.playerInfo = {};
    res.render('pages/connexion');
});

let lobbies = [];
let pplByLobby = 4;
io.sockets.on('connection', function(socket)
{
	// Enregistrement du Pseudo.
	app.post('/', (req, res) =>
	{
		let pseudo = ent.encode(req.body.pseudo);
		if (pseudo === undefined || pseudo === '')
		{
			req.alert('error', "Vous n'avez pas entré de pseudo!");
			res.redirect('/');
		}
		else
		{
			let reg = /^[a-z0-9]+$/i;
			let contentFilter = pseudo.match(reg);
			if (contentFilter === null)
			{
				req.alert('error', "Le pseudo ne peut être composé que de lettres et de chiffres!");
				res.redirect('/');
			}
			else
			{
				if (pseudo.length < 4 || pseudo.length > 16)
				{
					req.alert('error', "Le pseudo doit comporter entre 4 et 16 caractères");
					res.redirect('/');
				}
				else
				{
					socket.name = pseudo;
					req.session.playerInfo['pseudo'] = pseudo;
					res.render('pages/index',
					{
						main: 'menu'
					});
				}
			}
		}
	});

	// Créer un Lobby.
	app.get('/create', (req, res) =>
	{
		if (req.session.playerInfo === undefined || req.session.playerInfo === '' || req.session.playerInfo['pseudo'] === undefined || req.session.playerInfo['pseudo'] === '')
		{
			req.alert('error', "Vous n'avez pas entré de pseudo!");
			res.redirect('/');
		}
		else
		{
			socket.join(socket.id);
			socket.room = socket.id;
			// let lobby = [id room, nom du manager, ppl2, ppl3, ...(en fonction de 'pplByLobby'), true pour room ouverte(il reste de la place)]
			let lobby = [socket.id, socket.name];
			for (let i = 0, length = pplByLobby - 1; i < length; i++)
			{
				lobby.push('');
			}
			lobby.push('true');
			lobbies.push(lobby);
			console.log(lobbies);
			socket.broadcast.emit('refreshLobbiesList', lobbies);
			res.render('pages/index',
			{
				main: 'lobby'
			});
		}
	});
	// Afficher la Page des Lobbies.
	app.get('/lobbiesList', (req, res) =>
	{
		if (req.session.playerInfo === undefined || req.session.playerInfo === '' || req.session.playerInfo['pseudo'] === undefined || req.session.playerInfo['pseudo'] === '')
		{
			req.alert('error', "Vous n'avez pas entré de pseudo!");
			res.redirect('/');
		}
		else
		{
		    res.render('pages/index',
		    {
		    	main: 'lobbiesList'
		    });
		}
	});
	// Refresh la Liste des Lobbies.
	socket.on('refreshLobbiesList', function (list)
	{
		socket.emit('refreshLobbiesList', lobbies);
	});
});