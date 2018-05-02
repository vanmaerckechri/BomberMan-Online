let socket = io.connect(window.location.host);

socket.on('refreshLobbiesList', function(list)
{
	if (document.querySelector('#lobbiesList'))
	{
		let lobbiesListContainer = document.querySelector('#lobbiesList');
		lobbiesListContainer.innerHTML = '';
		for (let i = 0, length = list.length; i < length; i++)
		{
			lobbiesListContainer.innerHTML += '<button class="button">'+list[i][1]+'</button>';
		}
	}
});

socket.on('checkSocket', function ()
{
	socket.emit('checkSocket');
});

window.addEventListener('load', function()
{
	socket.emit('refreshLobbiesList');

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
					let menu = '<h1>Lobby</h1>';
					menu +=	'<div class="menuMain">';
					menu +=	'<h2>Menu Principal</h2>';
					menu += '<a id="createLobby" class="button" href="/createLobby">Créer un Lobby</a>';
					menu +=	'<a id="loadLobbiesList" class="button" href="/lobbiesList">Rejoindre un Lobby</a>';
					menu +=	'</div>';
					main.innerHTML = menu;
					// Menu Principal.
					let create = document.querySelector('#createLobby');
					create.addEventListener('click', function()
					{
						socket.emit('createLobby');
					});
				}
				else
				{
					let errorSms = document.querySelector('.error');
									console.log(errorSms);

					errorSms.innerHTML = pseudoValide[1];

				}
			});

		});
	}
});
