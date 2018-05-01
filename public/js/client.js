let socket = io.connect(window.location.host);

socket.on('refreshLobbiesList', function (list)
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

window.addEventListener('load', function()
{
	socket.emit('refreshLobbiesList');
});