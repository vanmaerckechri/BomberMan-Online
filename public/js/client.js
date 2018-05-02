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
		let main = document.querySelector('#main');
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
					let menu = '<h1>Lobby</h1>';
					menu +=	'<div class="menuMain">';
					menu +=	'<h2>Menu Principal</h2>';
					menu += '<a id="createLobby" class="button" href="/lobby">Créer un Lobby</a>';
					menu +=	'<a id="loadLobbiesList" class="button" href="/lobbiesList">Rejoindre un Lobby</a>';
					menu +=	'</div>';
					main.innerHTML = menu;
					let create = document.querySelector('#createLobby');
					create.addEventListener('click', function()
					{
						socket.emit('createLobby');
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
	// Liste des Lobbies.
	if (document.querySelector('#lobbiesList'))
	{
		socket.emit('refreshLobbiesList');
		socket.on('refreshLobbiesList', function(list)
		{
			let lobbiesListContainer = document.querySelector('#lobbiesList');
			lobbiesListContainer.innerHTML = '';
			for (let i = 0, length = list.length; i < length; i++)
			{
				let room = "'"+list[i][0]+"'";
				lobbiesListContainer.innerHTML += '<button class="button" onclick="joinLobby('+room+')">'+list[i][1]+'</button>';
			}
		});
	}
});

// Joindre un Lobby.
function joinLobby(room)
{
	socket.emit('joinLobby', room);
}

socket.on('message', function(sms)
{
	console.log(sms);
		//socket.join('some room');
});