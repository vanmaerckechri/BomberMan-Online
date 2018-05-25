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

app.post('/game', (req, res) =>
{
	res.render('pages/game')	
});

// GAME!

function filterGameInfos(infos)
{

}

//----------------------------------------------------

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
	for (let i = 0; i < pplByLobbyMax - 1; i++)
	{
		socketName.push('');
	}
	let avatars = [];
	let ready = [0]
	let lobby = {options, socketName, avatars, ready};
	lobbies[socket.id] = lobby;
	socket.room = socket.id;
	socket.avatar = 0;
	socket.ready = 0;
	lobbies[socket.id].avatars = resetAvatarsList(socket.id);
	lobbies[socket.id].avatars[0] = 0;
	lobbies[socket.id].launchGame = 0;
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
				let avatars = updateAvatarsList(rooms[i]);
				socket.emit('refreshLobby', {names: lobbies[rooms[i]].socketName, pplByLobby: lobbies[rooms[i]].options.pplByLobby, avatars: avatars});
				let usersList = returnSocketsId(rooms[i]);
				socket.emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[rooms[i]], lobbyId: rooms[i]});
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
						socket.ready = 0;
						giveAvatarDefault(rooms[i], j);
						let avatars = updateAvatarsList(roomId);
						socket.broadcast.to(roomId).emit('refreshLobby', {names: lobbies[rooms[i]].socketName, pplByLobby: lobbies[rooms[i]].options.pplByLobby, avatars: avatars});
						socket.emit('refreshLobby', {names: lobbies[rooms[i]].socketName, pplByLobby: lobbies[rooms[i]].options.pplByLobby, avatars: avatars});
						let usersList = returnSocketsId(rooms[i]);
						io.sockets.connected[roomId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[rooms[i]], lobbyId: rooms[i]});
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
	if (lobbies[socket.room] && lobbies[socket.room].launchGame === 0)
	{
		let rooms = Object.keys(lobbies);
		if (rooms.length > 0 && socket.room)
		{
			// Effacer le lobby actuel.
			let room = socket.room;
			let pplByLobbyBeforeChange = lobbies[room].options.pplByLobby;
			lobbies[room].options.open = false;
			socket.leave(room);
			socket.room = undefined;
			delete lobbies[room];
			if (io.sockets.adapter.rooms[room] != undefined)
			{
				// Créer un nouveau lobby.
				let roomSockets = returnSocketsId(room);
				let newRoomId = roomSockets[0];
				let options = {open: true, pplByLobbyMin: pplByLobbyMin, pplByLobbyMax: pplByLobbyMax, pplByLobby: pplByLobbyBeforeChange};
				lobbies[newRoomId] =
				{
					options: options,
					socketName: []
				};
				for (let i = 0; i < lobbies[newRoomId].options.pplByLobbyMax; i++)
				{
					if (roomSockets[i])
					{
						lobbies[newRoomId].socketName[i] = io.sockets.connected[roomSockets[i]].name;

						io.sockets.connected[roomSockets[i]].join(newRoomId);
						io.sockets.connected[roomSockets[i]].room = newRoomId;
						if (room === socket.id)
						{
							io.sockets.connected[roomSockets[i]].leave(room);
						}
					}
					else
					{
						lobbies[newRoomId].socketName[i] = '';
					}
				}
				lobbies[newRoomId].options.open = true;
				lobbies[newRoomId].avatars = resetAvatarsList(newRoomId);
				let avatars = updateAvatarsList(newRoomId);
				// Mettre à jour la liste des joueurs du lobby.
				socket.broadcast.to(newRoomId).emit('refreshLobby', {names: lobbies[newRoomId].socketName, pplByLobby: lobbies[newRoomId].options.pplByLobby, avatars: avatars});
				let usersList = returnSocketsId(newRoomId);
				io.sockets.connected[newRoomId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[newRoomId], lobbyId: newRoomId});
				updateReadyList(io.sockets.connected[newRoomId]);
			}
			socket.broadcast.emit('refreshLobbiesList', lobbies);
		}
	}
	else
	{
		delete lobbies[socket.room];
	}
}

// Tester l'authenticité de l'admin.
function checkAdminAuth(admin, user = false)
{
	// Récupération de tous les utilisateurs du lobby de l'admin.
	let lobbyUsers = returnSocketsId(admin);
	for (let i = 0, usersLength = lobbyUsers.length; i < usersLength; i++)
	{
		if (admin === lobbyUsers[0])
		{
			if (user === false || user === lobbyUsers[i])
			{
				return true
			}
		}
		else
		{
			return "Vous n'avez pas les droits pour effectuer cette action!";
		}
	}
	if (user === false)
	{
		return "Un problème est survenu!";
	}
	else
	{
		return "Utilisateur introuvable!";
	}
}

// Envoyer un message d'alerte.
function sendAlert(socket, sms)
{
	socket.emit('sendAlert', sms);
}

// Récupérer Position du Socket dans la Liste.
function checkPositionSockets(socket)
{
	let room = socket.room;
	let sockets = returnSocketsId(room);
	for (let i = 0, socketLength = sockets.length; i < socketLength; i++)
	{
		if (sockets[i] === socket.id)
		{
			return i;
		}
	}
}

function checkAvatarsList(socket)
{
	let room = socket.room;
	let avatarsList = lobbies[room].avatars;
	let socketIndex = checkPositionSockets(socket);
	socket.emit('checkAvatarsList', socketIndex, avatarsList);
}

// AVATARS
function resetAvatarsList(roomId)
{
	let avatarsTypeNumber = 6;
	lobbies[roomId].avatars = [];
	// avatars: '0' => le joueur à l'index '0' de la room, false => pas utilisé.
	for (let i = 0; i < avatarsTypeNumber; i++)
	{
		lobbies[roomId].avatars.push(false);
	}
	return lobbies[roomId].avatars;
}

// Donner un Avatar par Défaut lors d'une Mise à Jour Lobby.
function giveAvatarDefault(roomId, pplIndex)
{
	let sockets = returnSocketsId(roomId);
	let avatarList = lobbies[roomId].avatars;
	for (let i = 0, listLength = avatarList.length; i < listLength; i++)
	{
		if (avatarList[i] === false)
		{
			lobbies[roomId].avatars[i] = pplIndex;
			io.sockets.connected[sockets[pplIndex]].avatar = i;
			return;
		}
	}
}

// Trier les Avatars.
function updateAvatarsList(roomId)
{
	let sockets = returnSocketsId(roomId);
	let avatars = [];
	for (let i = 0, socketsLength = sockets.length; i < socketsLength; i++)
	{
		let avatar = io.sockets.connected[sockets[i]].avatar;
		let imgIndex = avatar + 1;
		avatars[i] = 'assets/img/avatar'+imgIndex+'.png';
		lobbies[roomId].avatars[avatar] = i;
	}
	return avatars;
}

// Mettre à Jour l'Affichage du Panneau Avatars.
function changeAvatar(socket, newAvatarIndex)
{
	let sockets = returnSocketsId(socket.room);
	let roomId = socket.room;
	let roomAvatars = lobbies[roomId].avatars;
	let socketIndexInAvatars;
	let socketIndex;
	for (let i = 0, socketsLength = sockets.length; i < socketsLength; i++)
	{
		if (socket.id === sockets[i])
		{
			socketIndex = i;
			break;
		}
	}
	for (let i = 0, roomAvatarsLength = roomAvatars.length; i < roomAvatarsLength; i++)
	{
		// Vérifier que l'avatar n'est pas déjà occupé...

		if (roomAvatars[newAvatarIndex] !== false && roomAvatars[newAvatarIndex] !== socketIndex)
		{
			return;
		}
	}
	// Si l'avatar n'est pas occupé...
	socket.avatar = newAvatarIndex;
	resetAvatarsList(roomId);
	let avatars = updateAvatarsList(roomId);
	socket.emit('refreshLobby', {names: lobbies[roomId].socketName, pplByLobby: lobbies[roomId].options.pplByLobby, avatars: avatars});
	socket.broadcast.to(roomId).emit('refreshLobby', {names: lobbies[roomId].socketName, pplByLobby: lobbies[roomId].options.pplByLobby, avatars: avatars});
	io.sockets.connected[roomId].emit('refreshLobbyAdmin', {usersId: sockets, lobby: lobbies[roomId], lobbyId: roomId});
	checkAvatarsList(socket);
	socket.emit('toggleDisplayAvatarsPannel');
	displayReadyList(socket)
}

// LAUNCH GAME!
function resetReadyList(socket)
{
	let sockets = returnSocketsId(socket.room);
	lobbies[socket.room].ready = [];
	for (let i = 0, socketsLength = sockets.length; i < socketsLength; i++)
	{
		io.sockets.connected[sockets[i]].ready = 0;
	}
	socket.emit('unReadyButton');
	socket.broadcast.to(socket.room).emit('unReadyButton');
}

function toggleReady(socket)
{
	if (socket.ready === 1)
	{
		socket.ready = 0;
	}
	else
	{
		socket.ready = 1;
	}
	updateReadyList(socket);
}

function updateReadyList(socket)
{
	let sockets = returnSocketsId(socket.room);
	lobbies[socket.room].ready = [];
	for (let i = 0, socketsLength = sockets.length; i < socketsLength; i++)
	{
		lobbies[socket.room].ready.push(io.sockets.connected[sockets[i]].ready);
	}
	checkToLaunchGame(socket);
	displayReadyList(socket);
}

function displayReadyList(socket)
{
	socket.emit('updateDisplayUsersReady', lobbies[socket.room].ready);
	socket.broadcast.to(socket.room).emit('updateDisplayUsersReady', lobbies[socket.room].ready);
}

let games = {};

function checkToLaunchGame(socket)
{
	let sockets = returnSocketsId(socket.room);
	let pplByLobby = lobbies[socket.room].options.pplByLobby;
	let pplInThisRoom = sockets.length;
	let userNames = [];
	let avatars = [];
	let scores = [];
	let alive = [];
	if (pplInThisRoom === pplByLobby)
	{
		let gameId = '';
		for (let i = 0; i < pplByLobby; i++)
		{
			if (io.sockets.connected[sockets[i]].ready === 0)
			{
				return;
			}
			gameId += io.sockets.connected[sockets[i]].id;
			userNames.push(io.sockets.connected[sockets[i]].name);
			avatars.push(io.sockets.connected[sockets[i]].avatar);
			scores.push(0);
			alive.push(1);
		}
		// Gabarit de l'objet d'une partie.
		let newGame = 
		{
			userIds: [],
			userNames: userNames,
			alive: alive,
			avatars: avatars,
			scores: scores,
			pplByLobby: pplByLobby,
			pplInThisRoom: 0
		};
		games[gameId] = newGame;
		for (let i = 0; i < pplByLobby; i++)
		{
			let avatar = io.sockets.connected[sockets[i]].avatar;
			let name = io.sockets.connected[sockets[i]].name;
			lobbies[socket.room].launchGame = 1;
			io.sockets.connected[sockets[i]].emit('loadGame', { gameId: gameId, playerIndex: i });
		}
	}
}

// GAME!

function initGame(socket, gameInfos)
{
	let gameId = gameInfos.gameId;
	let playerIndex = gameInfos.playerIndex;
	// Ajouter les nouveaux ids des joueurs dans la partie actuelle.
	games[gameId].userIds[playerIndex] = socket.id;
	// Lier les infos perso au socket.
	socket.room = gameId;
	socket.join(gameId);
	socket.playerIndex = playerIndex;
	socket.name = games[gameId].userNames[playerIndex];
	socket.avatar = games[gameId].avatars[playerIndex];
	socket.score = games[gameId].scores[playerIndex];

	games[gameId].pplInThisRoom++;
}

function checkVictory(socket)
{
	let playersAlive = games[socket.room].pplByLobby;
	let indexAlive;
	games[socket.room].alive[socket.playerIndex] = 0;
	for (let i = 0, playersLength = playersAlive; i < playersLength; i++)
	{
		if (games[socket.room].alive[i] == 0)
		{
			playersAlive--;
		}
		else
		{
			indexAlive = i;
		}
		// s'il en reste UN en vie, celui-ci gagne un point.
		if (playersAlive == 1)
		{
			console.log(games[socket.room].userNames[indexAlive]+' gagne un point');
		}
		console.log(playersAlive)
	}
	console.log(games[socket.room].alive)
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
		updateReadyList(socket);
		displayReadyList(socket);
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

	// Diminuer le nombre de places pour les utilisateurs dans le lobby.
	socket.on('decreasePplByLobby', function(id)
	{
		let lobbyId = ent.encode(id);
		let auth = checkAdminAuth(socket.id);
		if (auth === true && lobbies[lobbyId].options.pplByLobby > lobbies[lobbyId].options.pplByLobbyMin)
		{
			lobbies[lobbyId].options.pplByLobby--;
			let users = returnSocketsId(lobbyId);
			if (users[lobbies[lobbyId].options.pplByLobby])
			{
				let sms = "Vous avez été exclu!"
				leaveLobby(io.sockets.connected[users[lobbies[lobbyId].options.pplByLobby]]);
				io.sockets.connected[users[lobbies[lobbyId].options.pplByLobby]].emit('backToMainMenu', sms);
			}
			else
			{
				let avatars = updateAvatarsList(lobbyId);
				socket.emit('refreshLobby', {names: lobbies[lobbyId].socketName, pplByLobby: lobbies[lobbyId].options.pplByLobby, avatars: avatars});
				socket.broadcast.to(lobbyId).emit('refreshLobby', {names: lobbies[lobbyId].socketName, pplByLobby: lobbies[lobbyId].options.pplByLobby, avatars: avatars});
				let usersList = returnSocketsId(lobbyId);
				io.sockets.connected[lobbyId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[lobbyId], lobbyId: lobbyId});
				socket.broadcast.emit('refreshLobbiesList', lobbies);
			}
			if (lobbies[lobbyId].options.pplByLobby <= users.length)
			{
				lobbies[lobbyId].options.open = false;
			}
		}
		else
		{
			sendAlert(socket, auth);
		}
		resetReadyList(socket)
		displayReadyList(socket)
	});

	// Augmenter le nombre de places pour les utilisateurs dans le lobby.
	socket.on('increasePplByLobby', function(id)
	{
		let lobbyId = ent.encode(id);
		let auth = checkAdminAuth(socket.id);
		if (auth === true && lobbies[lobbyId].options.pplByLobby < lobbies[lobbyId].options.pplByLobbyMax)
		{
			lobbies[lobbyId].options.pplByLobby++;
			let users = returnSocketsId(lobbyId);
			if (lobbies[lobbyId].options.pplByLobby > users.length)
			{
				lobbies[lobbyId].options.open = true;
			}
			let avatars = updateAvatarsList(lobbyId);
			socket.emit('refreshLobby', {names: lobbies[lobbyId].socketName, pplByLobby: lobbies[lobbyId].options.pplByLobby, avatars: avatars});
			socket.broadcast.to(lobbyId).emit('refreshLobby', {names: lobbies[lobbyId].socketName, pplByLobby: lobbies[lobbyId].options.pplByLobby, avatars: avatars});
			let usersList = returnSocketsId(lobbyId);
			io.sockets.connected[lobbyId].emit('refreshLobbyAdmin', {usersId: usersList, lobby: lobbies[lobbyId], lobbyId: lobbyId});
			socket.broadcast.emit('refreshLobbiesList', lobbies);
		}
		else
		{
			sendAlert(socket, auth);
		}
		resetReadyList(socket)
		displayReadyList(socket)
	});

	// AVATARS!
	socket.on('loadAvatarsPannel', function()
	{
		loadAvatarsPannel(socket);
	});

	socket.on('changeAvatar', function(newAvatarIndex)
	{
		changeAvatar(socket, newAvatarIndex);
	});

	// Récupérer Position du Socket dans la Liste.
	socket.on('checkAvatarsList', function()
	{
		checkAvatarsList(socket);
	});

	// LAUNCH GAME!
	socket.on('updateDisplayUsersReady', function()
	{
		toggleReady(socket);
	});

	// GAME!
	socket.on('authGameInfo', function(gameInfos)// gameInfos = { gameId, playerIndex }
	{
		let infos = JSON.parse(gameInfos)
		let gameInfosEncode = {};

		for (let property in infos)
		{
			let info = typeof infos[property] === "number" ? infos[property] : ent.encode(infos[property]);
			gameInfosEncode[property] = info;
		}
		initGame(socket, gameInfosEncode);
		// Verifier que tous les joueurs ont chargé la partie.
		if (games[socket.room].pplInThisRoom === games[socket.room].pplByLobby)
		{
			let avatars = games[socket.room].avatars;
			let names = games[socket.room].userNames;
			let scores = games[socket.room].scores;

			socket.emit('initGame', { avatars: avatars, names: names, scores: scores });
			socket.broadcast.to(socket.room).emit('initGame', { avatars: avatars, names: names, scores: scores });
		}
	});

	socket.on('sendPlayerPos', function(playerPos)
	{
		// ne pas oublier d'ajouter les encodes (playerPos).
		socket.broadcast.to(socket.room).emit('updateOtherPlayerPos', playerPos);
	});	

	socket.on('sendBombInfos', function(bombInfos)
	{
		// ne pas oublier d'ajouter les encodes (bombInfos).
		socket.broadcast.to(socket.room).emit('updateBombFromOtherPl', bombInfos);
	});

	socket.on('checkVictory', function()
	{
		checkVictory(socket);
	});

});