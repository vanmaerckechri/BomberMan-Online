window.addEventListener('load', function(){
	
	socket.emit('callPlayerIndex');

	socket.on('sendPlayerIndex', function(playerIndex)
	{
		console.log(playerIndex);
	});

});