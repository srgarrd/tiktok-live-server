const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const tiktokUsername = process.env.TIKTOK_USERNAME || 'tu_usuario_aqui';
const tiktokConnection = new WebcastPushConnection(tiktokUsername);

// Guardar usuarios que eligen país
const users = new Map();

// Escuchar comentarios
tiktokConnection.on('chat', (data) => {
  const country = data.comment.trim().toLowerCase();
  if (['colombia', 'mexico', 'argentina', 'peru', 'chile', 'brasil', 'venezuela', 'ecuador', 'uruguay', 'paraguay', 'bolivia', 'panama', 'costa rica', 'guatemala', 'elsalvador', 'honduras', 'nicaragua', 'cuba', 'republicadominicana', 'puertorico', 'espana', 'usa'].includes(country)) {
    users.set(data.uniqueId, {
      username: data.uniqueId,
      avatar: data.profilePictureUrl,
      country: country
    });
    io.emit('chat', users.get(data.uniqueId));
  }
});

// Escuchar regalos
tiktokConnection.on('gift', (data) => {
  const user = users.get(data.uniqueId);
  if (user) {
    io.emit('gift', {
      username: user.username,
      avatar: user.avatar,
      country: user.country,
      coins: data.diamondCount
    });
  }
});

// Conectar a TikTok
tiktokConnection.connect().then(() => {
  console.log(`✅ Conectado a TikTok: ${tiktokUsername}`);
}).catch(err => console.error('❌ Error conectando:', err));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor TikTok Live corriendo 🚀');
});

server.listen(process.env.PORT || 3000);
