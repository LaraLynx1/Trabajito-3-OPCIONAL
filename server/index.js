const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express(); // Creates HTTP server
app.use(express.json()); // utility to process JSON in requests
app.use(cors()); // utility to allow clients to make requests from other hosts or ips

const httpServer = createServer(app); // Explicity creates an HTTP server from the Express app

const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*', // Allow requests from any origin
	},
}); // Creates a WebSocket server, using the same HTTP server as the Express app and listening on the /real-time path

const db = {
	players: [],
};

app.get('/users', (request, response) => {
	response.send(db);
});

app.post('/user', (request, response) => {
	const { body } = request;

	console.log(body);

	//en la varibale existe se guarda la posicion donde esta el jugador dentro del vector o -1 si no existe
	const existe = db.players.findIndex((item) => item.name === body.name);

	if (existe == -1) {
		// No existe
		console.log('Player no exists');
		db.players.push(body);
	} else {
		console.log('Player already exists');

		db.players[existe] = body;
	}

	response.status(201).send(body); // We return the same object received and also I send a code 201 which means an object was created
});

io.on('connection', (socket) => {
	console.log('a player connected:', socket.id); // This will be printed every time a client connects to the

	socket.on('chat-messages', (message) => {
		console.log(message);
		socket.emit('chat-messages', message); //solo le envia el mensaje al sender

		const player = JSON.parse(message);

		//en la varibale existe se guarda la posicion donde esta el jugador dentro del vector o -1 si no existe
		const existe = db.players.findIndex((item) => item.name === player.name);

		if (existe == -1) {
			// No existe
			console.log('Player no exists');
			db.players.push(player);
		} else {
			console.log('Player already exists');
			db.players[existe] = player;
		}

		if (db.players.length == 2) {
			//ambos jugaron
			//debemos decir quien gano
			console.log('Ambos jugaron...');
			let ganador = '';
			let eleccion0 = db.players[0].choice;
			let eleccion1 = db.players[1].choice;
			if (eleccion0 == 'Rock') {
				if (eleccion1 == 'Rock') ganador = 'Empate. Ambos seleccionaron Rock';
				if (eleccion1 == 'Paper') ganador = 'El ganador es ' + db.players[1].name;
				if (eleccion1 == 'Scissors') ganador = 'El ganador es ' + db.players[0].name;
			}

			if (eleccion0 == 'Paper') {
				if (eleccion1 == 'Rock') ganador = 'El ganador es ' + db.players[0].name;
				if (eleccion1 == 'Paper') ganador = 'Empate. Ambos seleccionaron Rock';
				if (eleccion1 == 'Scissors') ganador = 'El ganador es ' + db.players[1].name;
			}

			if (eleccion0 == 'Scissors') {
				if (eleccion1 == 'Rock') ganador = 'El ganador es ' + db.players[1].name;
				if (eleccion1 == 'Paper') ganador = 'El ganador es ' + db.players[0].name;
				if (eleccion1 == 'Scissors') ganador = 'Empate. Ambos seleccionaron Rock';
			}
			const playerGanador = {
				...player,
				ganador,
			};
			io.emit('ganador-messages', JSON.stringify(playerGanador));
			db.players = [];
		}

		//io.emit('chat-messages', message); // Broadcasts the message to all connected clients including the sender
		//socket.broadcast.emit('chat-messages', message); // Broadcasts the message to all connected clients except the sender
	});
});

httpServer.listen(5050, () => {
	console.log(`Server is running on http://localhost:${5050}`);
});
