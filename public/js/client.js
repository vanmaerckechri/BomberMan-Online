let socket = io.connect(window.location.host);

socket.on('checkSocket', function ()
{
	socket.emit('checkSocket');
});

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
				console.log(pseudoValide);
				if (pseudoValide[0] === true)
				{
					// Menu Principal.
					loadMainMenu()
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
								for (let i = 0, length = list.length; i < length; i++)
								{
									let room = "'"+list[i][0]+"'";
									lobbiesListContainer.innerHTML += '<button class="button" onclick="joinLobby('+room+')">'+list[i][1]+'</button>';
								}
							}
						});
					});
				}
				else
				{
					let errorSms = document.querySelector('.error');
					errorSms.innerHTML = pseudoValide[1];
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
	main.innerHTML = menuContent;
}

// Charger liste des Lobbies.
function loadLobbiesList()
{
	let main = document.querySelector('#main');
	let lobbyListContent = '<h1>Lobby</h1>';
	lobbyListContent += '<div class="menuMain">';
	lobbyListContent += '<h2>Liste des Lobbies</h2>';
	lobbyListContent += '<div id="lobbiesList" class="lobbiesList">';
	lobbyListContent += '</div></div>';
	main.innerHTML = lobbyListContent;
}

// Charger le Lobby.
function loadLobby()
{
	let main = document.querySelector('#main');
	let lobbyContent = '<h1>Lobby</h1>';
	lobbyContent += '<div class="menuMain">';
	lobbyContent += '<div id="lobbyMembers" class="lobbyMembers">';
	lobbyContent += '</div></div>';
	main.innerHTML = lobbyContent;
}

// Joindre un Lobby.
function joinLobby(room)
{
	socket.emit('joinLobby', room);
	loadLobby()
}

// Update l'affichage Membres du Lobby.
socket.on('refreshLobby', function(names)
{
		console.log(names);

	refreshLobby(names);
	//socket.join('some room');
});

function refreshLobby(names)
{
	console.log(names);
	let lobbyMembersContainer = document.querySelector('#lobbyMembers');
	lobbyMembersContainer.innerHTML = '';
	for (let i = 1, length = names.length - 1; i < length; i++)
	{
		lobbyMembersContainer.innerHTML += '<p>'+names[i]+'</p>';
	}	
}