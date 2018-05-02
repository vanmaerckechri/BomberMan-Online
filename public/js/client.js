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
	let menu = '<h1>Lobby</h1>';
	menu +=	'<div class="menuMain">';
	menu +=	'<h2>Menu Principal</h2>';
	menu += '<button id="createLobby" class="button">Créer un Lobby</button>';
	menu +=	'<button id="loadLobbiesList" class="button">Rejoindre un Lobby</button>';
	menu +=	'</div>';
	main.innerHTML = menu;
}

// Charger liste des Lobbies.
function loadLobbiesList()
{
	let main = document.querySelector('#main');
	let menu = '<h1>Lobby</h1>';
	menu += '<div class="menuMain">';
	menu += '<h2>Liste des Lobbies</h2>';
	menu += '<div id="lobbiesList" class="lobbiesList">';
	menu += '</div></div>';
	main.innerHTML = menu;
}

// Charger le Lobby.
function loadLobby()
{
	let main = document.querySelector('#main');
	let menu = '<h1>Lobby</h1>';
	main.innerHTML = menu;
}

// Joindre un Lobby.
function joinLobby(room)
{
	socket.emit('joinLobby', room);
	loadLobby()
}

// Test message entre les membres d'une room...
socket.on('message', function(sms)
{
	console.log(sms);
	//socket.join('some room');
});