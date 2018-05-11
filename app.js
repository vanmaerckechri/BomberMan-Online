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
let pplByLobbyMin = 2;
let pplByLobbyMax = 4;

function createLobby(socket)
{
	let options = {open: true, pplByLobbyMin: pplByLobbyMin, pplByLobbyMax: pplByLobbyMax, pplByLobby: pplByLobbyMax};
	let socketName = [socket.name]
	let lobby = {options, socketName};
	for (let i = 0; i < pplByLobbyMax - 1; i++)
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
		let rooms = Object.keys(lobbies);
		for (let i = 0, lobbiesLength = rooms.length; i < lobbiesLength; i++)
		{
			// affichages admin lors de la creation du lobby.
			if (rooms[i] === socket.id)
			{
				socket.emit('refreshLobby', lobbies[rooms[i]].socketName)
				let usersList = returnSocketsId(rooms[i]);
				socket.emit('refreshLobbyAdmin', {usersId: usersList, lobby: rooms[i]});
				return;
			}
			// ajoute un membre à la room et affiche les membres. 
			else if (rooms[i] === roomId)
			{
				for (let j = 0, roomLength = lobbies[rooms[i]].socketName.length; j < roomLength; j++)
				{
					if (lobbies[rooms[i]].socketName[j] === '')
					{
						lobbies[rooms[i]].socketName[j] = socket.name;
						socket.join(roomId);
						socket.room = roomId;
						socket.broadcast.to(roomId).emit('refreshLobby', lobbies[rooms[i]].socketName);
						socket.emit('refreshLobby', lobbies[rooms[i]].socketName);
						let usersList = returnSocketsId(rooms[i]);
						io.sockets.connected[roomId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[rooms[i]]});
						// lobby full.
						if (j === lobbies[rooms[i]].options.pplByLobby - 1)
						{
							lobbies[rooms[i]].options.open = false;
							socket.emit('refreshLobbiesList', lobbies);
						}
						return;
					}
				}
			}
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
	let rooms = Object.keys(lobbies);
	if (rooms.length > 0 && socket.room)
	{
		// Effacer le lobby actuel.
		let room = socket.room;
		lobbies[room].options.open = false;
		socket.leave(room);
		socket.room = undefined;
		delete lobbies[room];
		if (io.sockets.adapter.rooms[room] != undefined)
		{
			// Créer un nouveau lobby.
			let roomSockets = returnSocketsId(room);
			let newRoomId = roomSockets[0];
			let options = {open: true, pplByLobbyMin: pplByLobbyMin, pplByLobbyMax: pplByLobbyMax, pplByLobby: pplByLobbyMax};
			lobbies[newRoomId] =
			{
				options: options,
				socketName: []
			};
			for (let i = 0; i < lobbies[newRoomId].options.pplByLobby; i++)
			{
				if (roomSockets[i])
				{
					lobbies[newRoomId].socketName[i] = io.sockets.connected[roomSockets[i]].name;

					io.sockets.connected[roomSockets[i]].join(newRoomId);
					io.sockets.connected[roomSockets[i]].room = newRoomId;
				}
				else
				{
					lobbies[newRoomId].socketName[i] = '';
				}
			}
			lobbies[newRoomId].options.open = true;
			// Mettre à jour la liste des joueurs du lobby.
			socket.broadcast.to(newRoomId).emit('refreshLobby', lobbies[newRoomId].socketName);
			let usersList = returnSocketsId(newRoomId);
			io.sockets.connected[newRoomId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[newRoomId]});
		}
		socket.broadcast.emit('refreshLobbiesList', lobbies);
	}
}

// Tester l'authenticité de l'admin lors d'une action sur un autre utilisateur du même lobby.
function checkAdminAuth(admin, user)
{
	// Récupération de tous les utilisateurs du lobby de l'admin.
	let lobbyUsers = returnSocketsId(admin);
	for (let i = 0, usersLength = lobbyUsers.length; i < usersLength; i++)
	{
		if (admin === lobbyUsers[0])
		{
			if (user === lobbyUsers[i])
			{
				return true
			}
		}
		else
		{
			return "Vous n'avez pas les droit pour effectuer cette action!";
		}
	}
	return "Utilisateur introuvable!";
}

// Envoyer un message d'alerte.
function sendAlert(socket, sms)
{
	socket.emit('sendAlert', sms);
}

// SOCKET.IO!

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
	socket.on('refreshLobbiesList', function()
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
		let room = ent.encode(roomId);
		joinLobby(socket, room);
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

	// Ejecter Utilisateur.
	socket.on('ejectUser', function(userId)
	{
		let user = ent.encode(userId);
		let auth = checkAdminAuth(socket.id, user);
		if (auth === true)
		{
			let sms = "Vous avez été exclu!"
			leaveLobby(io.sockets.connected[user]);
			io.sockets.connected[user].emit('backToMainMenu', sms);
		}
		else
		{
			sendAlert(socket, auth);
		}
	});
});