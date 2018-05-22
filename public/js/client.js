let socket = io.connect(window.location.host);

window.addEventListener('load', function()
{
	// Connexion
	if (document.querySelector('#submitPseudo'))
	{
		let submit = document.querySelector('#submitPseudo');
		let pseudo = document.querySelector('#pseudo');
		submit.addEventListener('click', function(e)
		{
			e.preventDefault();
			socket.emit('recordNewPlayerInfo', pseudo.value);
			socket.on('validatePseudo', function (pseudoValide)
			{
				if (pseudoValide[0] === true)
				{
					// Menu Principal.
					loadMainMenu()
				}
				else
				{
					displayAlert(pseudoValide[1])
				}
			});

		});
	}
});
// Charger Menu Principal.
function loadMainMenu()
{
	let main = document.querySelector('#main');
	let menuContent = '<h1>Lobby</h1>';
	menuContent +=	'<div class="menuMain">';
	menuContent +=	'<h2>Menu Principal</h2>';
	menuContent += '<button id="createLobby" class="button">Créer un Lobby</button>';
	menuContent +=	'<button id="loadLobbiesList" class="button">Rejoindre un Lobby</button>';
	menuContent +=	'</div>';
	menuContent += '<div class="error"></div>';
	main.innerHTML = menuContent;
	let create = document.querySelector('#createLobby');
	create.addEventListener('click', function()
	{
		// Lobby.
		loadLobby();
		socket.emit('createLobby');
	});
	let lobbiesListButton = document.querySelector('#loadLobbiesList');
	lobbiesListButton.addEventListener('click', function()
	{
		// Liste des Lobbies.
		loadLobbiesList()
		socket.emit('refreshLobbiesList');
		socket.on('refreshLobbiesList', function(list)
		{
			if (document.querySelector('#lobbiesList'))
			{
				let lobbiesListContainer = document.querySelector('#lobbiesList');
				lobbiesListContainer.innerHTML = '';
				let roomsId = Object.keys(list);
				if (roomsId.length > 0)
				{
					for (let i = 0, roomsLength = roomsId.length; i < roomsLength; i++)
					{
						if (list[roomsId[i]].options.open === true && roomsId[i] != '')
						{
							let roomId = "'"+roomsId[i]+"'";
							let roomName = list[roomsId[i]].socketName[0];
							lobbiesListContainer.innerHTML += '<button class="button" onclick="joinLobby('+roomId+')">'+roomName+'</button>';
						}
					}
				}
			}
		});
	});
}

// Charger liste des Lobbies.
function loadLobbiesList()
{
	let main = document.querySelector('#main');
	let lobbyListContent = '<h1>Lobby</h1>';
	lobbyListContent += '<div class="menuMain">';
	lobbyListContent += '<h2>Liste des Lobbies</h2>';
	lobbyListContent += '<div id="lobbiesList" class="lobbiesList"></div>';
	lobbyListContent += '</div>';
	lobbyListContent += '<div class="error"></div>';
	main.innerHTML = lobbyListContent;
}

// Charger le Lobby.
function loadLobby()
{
	let main = document.querySelector('#main');
	let lobbyContent = '<h1>Lobby</h1>';
	lobbyContent +=	'<div class="lobby">';
	lobbyContent +=	'<div id="lobbyMembers" class="lobbyMembers"></div>';
	lobbyContent += '<div class="talkBoard">';
	lobbyContent += '<div class="taskbar">';
	lobbyContent += '<button class="button notReady" onclick="toggleReady()"></button>';
	lobbyContent += '<button class="button backToMainMenu">X</button></div>';
	lobbyContent += '<div class="messages"></div>';
	lobbyContent += '<div class="inputMessageContainer">';
	lobbyContent += '<textarea name="inputMessage" class="inputMessage"></textarea>';
	lobbyContent += '<button class="button chatSend">Envoyer</button>';
	lobbyContent += '</div></div></div>';
	lobbyContent += '<div class="error"></div>';
	lobbyContent += '<div class="modalContainer">';
	lobbyContent += '<div class="chooseAvatarContainer">';
	lobbyContent += '<div class="chooseAvatar"></div>';
	lobbyContent += '<div class="introduceAvatar"></div>';
	lobbyContent += '<button class="button avatarValidateButton" onclick="changeAvatar()">OK</button>';
	lobbyContent += '</div></div>';
	main.innerHTML = lobbyContent;
	let chatSend = document.querySelector('.chatSend');
	let smsContainer = document.querySelector('.inputMessage');
	chatSend.addEventListener('click', function()
	{
		socket.emit('sendMessage', smsContainer.value);
		smsContainer.value = '';
	})
	let backToMainMenuButton = document.querySelector('.backToMainMenu');
	backToMainMenuButton.addEventListener('click', function()
	{
		loadMainMenu();
		socket.emit('leaveLobby');
	})
}

// Joindre un Lobby.
function joinLobby(room)
{
	socket.emit('joinLobby', room);
	loadLobby();
}

// Update l'affichage Membres du Lobby.
socket.on('refreshLobby', function(names)
{
	refreshLobby(names);
});

function refreshLobby(lobbyInfos)
{
	let lobbyMembersContainer = document.querySelector('#lobbyMembers');
	lobbyMembersContainer.innerHTML = '';
	let avatars = lobbyInfos.avatars;
	for (let i = 0; i < lobbyInfos.pplByLobby; i++)
	{
		if (lobbyInfos.names[i] != '')
		{
			lobbyMembersContainer.innerHTML += '<div class="pseudo"><img class="avatar" src="'+avatars[i]+'" alt="avatar du joueur">'+lobbyInfos.names[i]+'<span class="eject"></span></div>';
		}
		else
		{
			lobbyMembersContainer.innerHTML += '<div class="pseudo"></div>';
		}
	}
	socket.emit('checkAvatarsList');
}

socket.on('checkAvatarsList', function(indexOfThisPlayer, avatarsSelectedIndex)
{
	loadAvatarsPannel(indexOfThisPlayer, avatarsSelectedIndex)
});

// Afficher le Panneau des Avatars
socket.on('toggleDisplayAvatarsPannel', function()
{
	toggleDisplayAvatarsPannel();
});

function toggleDisplayAvatarsPannel(socketIndex = undefined)
{
	let pseudoBox = document.querySelectorAll('.pseudo');
	if (socketIndex != undefined && pseudoBox[socketIndex].classList.contains('pseudoReady'))
	{
		return;
	}
	let modalContainer = document.querySelector('.modalContainer');
	modalContainer.classList.toggle('displayAvatarsPannel');
}

// Gestion des Avatars
function loadAvatarsPannel(indexOfThisPlayer, avatarsSelectedIndex)
{
	// Encadrer le Cadre Pseudo du Joueur.
	let socketIndex = indexOfThisPlayer;
	let pseudoBox = document.querySelectorAll('.pseudo');
	pseudoBox[socketIndex].classList.add('selected');
	pseudoBox[socketIndex].setAttribute('onclick', 'toggleDisplayAvatarsPannel('+socketIndex+')');

	// Mettre à Jour le Panneau des Avatars.
	let chooseAvatarBox = document.querySelector('.chooseAvatar');
	chooseAvatarBox.innerHTML = "";
	let avatarTypeNumber = 6;
	let avatarIndex;
	for (let i = 0; i < avatarTypeNumber; i++)
	{
		let j = i + 1;
		if (avatarsSelectedIndex[i] === false)
		{
			chooseAvatarBox.innerHTML += '<img class="avatar" src="assets/img/avatar'+j+'.png" alt="" onclick="selectAvatar('+i+')">';
		}
		else
		{
			chooseAvatarBox.innerHTML += '<img class="avatar taked" src="assets/img/avatar'+j+'.png" alt="" onclick="selectAvatar('+i+')">';			
		}
		if (avatarsSelectedIndex[i] === socketIndex)
		{
			avatarIndex = i;
		}
	}

	socketIndex++;
	selectAvatar(avatarIndex);
}

function selectAvatar(avatarSelected)
{
	let avatarBox = document.querySelectorAll('.chooseAvatar .avatar');
	let avatarIndex = avatarSelected + 1;
	for (let i = 0, avatarsLength = avatarBox.length; i < avatarsLength; i++)
	{
		if (avatarBox[i].classList.contains('selected'))
		{
			avatarBox[i].classList.remove('selected');
		}
	}
	avatarBox[avatarSelected].classList.add('selected');

	let introduceAvatarBox = document.querySelector('.introduceAvatar');
	introduceAvatarBox.innerHTML = '<img src="assets/img/skin'+avatarIndex+'.png" alt="">';

	let avatarValidateButton = document.querySelector('.avatarValidateButton');
	avatarValidateButton.setAttribute('onclick', 'changeAvatar('+avatarSelected+')');
}

function changeAvatar(newAvatarIndex)
{
	socket.emit('changeAvatar', newAvatarIndex);
}

// Update l'affichage des commandes admin dans le lobby.
socket.on('refreshLobbyAdmin', function(lobbyInfos)
{
	if (document.querySelectorAll('.eject'))
	{
		let ejectButton = document.querySelectorAll('.eject')
		for (let i = 1, ejectLength = ejectButton.length; i < ejectLength; i++)
		{
			let userId = "'"+lobbyInfos.usersId[i]+"'";
			ejectButton[i].innerHTML = '<button class="button" onclick="ejectUser('+userId+')">X</span>';
		}
		let lobbyMembers = document.querySelector('#lobbyMembers');
		let lobbyId = "'"+lobbyInfos.lobbyId+"'"
		if (lobbyInfos.lobby.options.pplByLobby > lobbyInfos.lobby.options.pplByLobbyMin)
		{
			lobbyMembers.innerHTML += '<button class="button" onclick="decreasePplByLobby('+lobbyId+')">-</span>';
		}
		if (lobbyInfos.lobby.options.pplByLobby < lobbyInfos.lobby.options.pplByLobbyMax)
		{
			lobbyMembers.innerHTML += '<button class="button" onclick="increasePplByLobby('+lobbyId+')">+</span>';
		}
	}
});

function decreasePplByLobby(lobbyId)
{
	socket.emit('decreasePplByLobby', lobbyId);
}

function increasePplByLobby(lobbyId)
{
	socket.emit('increasePplByLobby', lobbyId);
}

// Lancer la Partie.
function toggleReady()
{	
	let notReady = document.querySelector('.notReady');
	notReady.classList.toggle('ready');
	socket.emit('updateDisplayUsersReady');
}

socket.on('updateDisplayUsersReady', function(readyList)
{
	let pseudoBox = document.querySelectorAll('.pseudo')
	// Afficher un marqueur visuel sur les utilisateurs prêt (border vert).
	for (let i = 0, readyListLength = readyList.length; i < readyListLength; i++)
	{
		if (readyList[i] === 1 && pseudoBox[i])
		{
			pseudoBox[i].classList.add('pseudoReady')
		}
		else
		{
			pseudoBox[i].classList.remove('pseudoReady')		
		}
	}
});

socket.on('checkToLaunchGame', function(gameInfos)
{
	let form = document.createElement("form");
	form.setAttribute("method", "POST");
	form.setAttribute("action", "game");
	let input = document.createElement("input");
	for(let propt in gameInfos)
	{
		alert(gameInfos[propt])
		input.setAttribute("type", "hidden");
		input.setAttribute("name", propt);
		input.setAttribute("value", gameInfos[propt]);
		form.appendChild(input);
	}
	document.body.appendChild(form);
	form.submit();
});


socket.on('unReadyButton', function()
{
	let notReady = document.querySelector('.notReady');
	if (notReady.classList.contains('ready'))
	{
		notReady.classList.remove('ready');
	}
});

// Messages d'Alerte.
socket.on('sendAlert', function(sms)
{
	displayAlert(sms);
});

function displayAlert(sms)
{
	let errorSms = document.querySelector('.error');
	errorSms.innerHTML = sms;
}

// CHAT
// Afficher Message.
socket.on('sendMessage', function(message)
{
	if (message.sms != undefined && message.sms != '')
	{
		let messages = document.querySelector('.messages');
		let newSms = '<p class="user">'+message.broadcaster+': ';
		newSms += '<span class="message">'+message.sms+'</p>';
		messages.innerHTML += newSms;
	}
});

// Ejecter Utilisateur.
function ejectUser(user)
{
	socket.emit('ejectUser', user);
}
socket.on('backToMainMenu', function(sms)
{
	loadMainMenu();
	displayAlert(sms);
});