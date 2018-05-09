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

// ROUTES!

// Route Principale.
app.get('/', (req, res) =>
{
	req.session.playerInfo = {};
		res.render('pages/index',
	{
		main: 'connexion'
	});
});

function validatePseudo(pseudo)
{
	let errorSms;
	if (pseudo === undefined || pseudo === '')
	{
		errorSms = "Vous n'avez pas entré de pseudo!";
		return [false, errorSms];
	}

	let reg = /^[a-z0-9]+$/i;
	let contentFilter = pseudo.match(reg);
	if (contentFilter === null)
	{
		errorSms = "Le pseudo ne peut être composé que de lettres et de chiffres!";
		return [false, errorSms];
	}

	if (pseudo.length < 4 || pseudo.length > 16)
	{
		errorSms = "Le pseudo doit comporter entre 4 et 16 caractères";
		return [false, errorSms];
	}
	return [true, pseudo];
}

let lobbies = {};
let pplByLobby = 4;

function createLobby(socket)
{
	let options = {open: true};
	let socketName = [socket.name]
	let lobby = {options, socketName};
	for (let i = 0; i < pplByLobby - 1; i++)
	{
		lobby.socketName.push('');
	}
	lobbies[socket.id] = lobby;
	socket.room = socket.id;
	socket.broadcast.emit('refreshLobbiesList', lobbies);
}

function joinLobby(socket, roomId)
{
	if (lobbies[roomId].options.open === true)
	{
		let roomsId = Object.keys(lobbies);
		for (let i = 0, lobbiesLength = roomsId.length; i < lobbiesLength; i++)
		{
			// affichage membre lors de la creation du lobby.
			if (roomsId[i] === socket.id)
			{
				socket.emit('refreshLobby', lobbies[roomsId[i]].socketName);
				return;
			}
			// ajoute un membre à la room et affiche les membres. 
			else if (roomsId[i] === roomId)
			{
				for (let j = 0, roomLength = lobbies[roomsId[i]].socketName.length; j < roomLength; j++)
				{
					if (lobbies[roomsId[i]].socketName[j] === '')
					{
						lobbies[roomsId[i]].socketName[j] = socket.name;
						socket.join(roomId);
						socket.room = roomId;
						socket.broadcast.to(roomId).emit('refreshLobby', lobbies[roomsId[i]].socketName);
						socket.emit('refreshLobby', lobbies[roomsId[i]].socketName);
						// lobby full.
						console.log('j:'+j);
						console.log(roomLength);
						if (j === roomLength - 1)
						{
							lobbies[roomsId[i]].options.open = false;
							socket.emit('refreshLobbiesList', lobbies[roomsId[i]]);
						}
						return;
					}
				}
			}
		}
	}
}

function checkLobbyIndex(room)
{
	for (let i = 0, length = lobbies.length; i < length; i++)
	{
		// Detecter le lobby dans lequel se trouve l'utilisateur.
		if (lobbies[i][0] === room)
		{
			return i;
		}
	}	
}

function returnSocketsId(room)
{
	let roomSockets = Object.getOwnPropertyNames(io.sockets.adapter.rooms[room].sockets);
	return roomSockets;
}

function leaveLobby(socket)
{
	// S'il reste d'autres utilisateurs dans le lobby...
	if (lobbies.length > 0)
	{
		let room = socket.room;
		let lobbyIndex = checkLobbyIndex(room);
		lobbies[lobbyIndex][(lobbies[lobbyIndex].length) - 1] = false;
		if (io.sockets.adapter.rooms[room] != undefined)
		{
			socket.leave(room);
			let roomSockets = returnSocketsId(room);
			console.log(roomSockets)
			// Attribution d'un nouvel ID au lobby.
			lobbies[lobbyIndex][0] = roomSockets[0];
			for (let i = 1, lobbyLength = (lobbies[lobbyIndex].length) - 1; i < lobbyLength; i++)
			{
				// Réorganisation du lobby.
				if (roomSockets[i - 1])
				{
					lobbies[lobbyIndex][i] = io.sockets.connected[roomSockets[i - 1]].name;

					io.sockets.connected[roomSockets[i - 1]].join(lobbies[lobbyIndex][0]);
					io.sockets.connected[roomSockets[i - 1]].room = lobbies[lobbyIndex][0];
				}
				else
				{
					lobbies[lobbyIndex][i] = '';
				}
			}
			lobbies[lobbyIndex][(lobbies[lobbyIndex].length) - 1] = true;
			// Mettre à jour la liste des joueurs du lobby.
			socket.broadcast.to(lobbies[lobbyIndex][0]).emit('refreshLobby', lobbies[lobbyIndex]);
		}
		socket.broadcast.emit('refreshLobbiesList', lobbies);
	}
}

io.sockets.on('connection', function(socket)
{
	socket.on('disconnect', function()
	{
		leaveLobby(socket);
	});

	socket.on('leaveLobby', function()
	{
		leaveLobby(socket);
	});

	socket.on('pullPseudo', function()
	{
		socket.emit('pullPseudo', req.session.playerInfo['pseudo']);
	});

	socket.on('recordNewPlayerInfo', function(pseudo)
	{
		pseudoEncode = ent.encode(pseudo);
		let pseudoValide = validatePseudo(pseudo)

		if (pseudoValide[0] === true)
		{
			socket.name = pseudoValide[1];
		}
		socket.emit('validatePseudo', pseudoValide);
	});

	// Refresh la Liste des Lobbies.
	socket.on('refreshLobbiesList', function(list)
	{
		socket.emit('refreshLobbiesList', lobbies);
	});

	// Créer un Lobby.
	socket.on('createLobby', function()
	{
		socket.join(socket.id);
		createLobby(socket);
		joinLobby(socket, socket.id)
	});

	// Joindre un Lobby.
	socket.on('joinLobby', function(roomId)
	{
		joinLobby(socket, roomId);
		socket.broadcast.emit('refreshLobbiesList', lobbies);
		// le nombre de clients dans une room...
		//console.log((io.sockets.adapter.rooms[roomId]).length);
	});

	// CHAT!
	// Send Message.
	socket.on('sendMessage', function(message)
	{
		let messageEncode = ent.encode(message);
		socket.to(socket.room).emit('sendMessage', {sms: messageEncode, broadcaster: socket.name});
		socket.emit('sendMessage', {sms: messageEncode, broadcaster: socket.name});
	});
});