const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware para analizar el cuerpo de las peticiones
app.use(express.json());

// Arreglos en memoria para almacenar los usuarios y los mensajes
let users = [];
let messages = [];

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Ruta para registrar un usuario (enviar los datos como JSON)
app.post('/register', (req, res) => {
  const { name, image } = req.body;
  
  if (!name || !image) {
    return res.status(400).send('El nombre y la imagen son obligatorios.');
  }

  // Almacenar el usuario en el arreglo
  const newUser = { name, image };
  users.push(newUser);

  // Emitir el evento de registro al servidor de Socket.IO
  io.emit('user registered', newUser);

  return res.status(200).send({ message: 'Usuario registrado correctamente', user: newUser });
});

// Ruta para obtener todos los usuarios registrados
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Ruta para obtener todos los mensajes
app.get('/messages', (req, res) => {
  res.status(200).json(messages);
});

// Ruta para enviar un mensaje (simular un mensaje)
app.post('/send-message', (req, res) => {
  const { name, image, message } = req.body;

  if (!name || !image || !message) {
    return res.status(400).send('El nombre, la imagen y el mensaje son obligatorios.');
  }

  // Almacenar el mensaje en el arreglo
  const newMessage = { name, image, message };
  messages.push(newMessage);

  // Emitir el evento de mensaje de chat al servidor de Socket.IO
  io.emit('chat message', newMessage);

  return res.status(200).send({ message: 'Mensaje enviado correctamente' });
});

// Manejar la conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});
