let socket = io('http://localhost:5050', { path: '/real-time' });

socket.io.on('error', (error) => {
	console.log('Error al conectase al Socket');
});

socket.on('chat-messages', (message) => {
	console.log(message);
	renderData('Jugada del Player enviada .... esperando esultado');
});

socket.on('ganador-messages', (playerganador) => {
	const player = JSON.parse(playerganador);
	console.log('El gandor fue ' + player.ganador);
	renderData(player.ganador);
});

document.getElementById('jugar').addEventListener('click', jugar2);

async function jugar2() {
	const playerChoice = document.getElementById('choice').value;
	const playerName = document.getElementById('name').value;

	console.log('name', playerName.length);
	if (playerName.length == 0) return;

	const player = {
		name: playerName,
		choice: playerChoice,
		profilePicture: 'https://avatar.iran.liara.run/public/13', // Placeholder image
	};

	socket.emit('chat-messages', JSON.stringify(player));
}

async function jugar() {
	renderLoadingState();
	try {
		const playerName = document.getElementById('name').value;
		const playerChoice = document.getElementById('choice').value;
		console.log(playerName, playerChoice);

		const player = {
			name: playerName,
			choice: playerChoice,
			profilePicture: 'https://avatar.iran.liara.run/public/13', // Placeholder image
		};

		const response = await fetch('http://localhost:5050/user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json', // Specify the content type as JSON
			},
			body: JSON.stringify(player), // Convert the data to a JSON string
		});

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		console.log('Player data sent successfully', response);

		renderData();
	} catch (error) {
		renderErrorState();
	}
}

function renderData(texto) {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	const div = document.createElement('div');
	div.className = 'item';
	div.innerHTML = texto;
	container.appendChild(div);
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Failed to load data</p>';
	console.log('Failed to load data');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}
