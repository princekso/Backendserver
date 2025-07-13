// 📁 server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { generateDeck, drawCardFromDeck, isValidPlay } = require('./unoGame');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const games = {};

io.on('connection', (socket) => {
  socket.on('join', ({ player, room }) => {
    socket.join(room);

    if (!games[room]) {
      const deck = generateDeck();
      games[room] = {
        players: [],
        hands: {},
        deck,
        discard: [],
        currentTurn: '',
        direction: 1
      };
    }

    const game = games[room];
    if (!game.players.includes(player)) {
      game.players.push(player);
      game.hands[player] = [drawCardFromDeck(game), drawCardFromDeck(game), drawCardFromDeck(game), drawCardFromDeck(game), drawCardFromDeck(game)];
    }

    if (game.players.length === 4) {
      const topCard = drawCardFromDeck(game);
      game.discard.push(topCard);
      game.currentTurn = game.players[0];

      io.to(room).emit('startGame', {
        players: game.players,
        hand: game.hands[player],
        topCard
      });
    }
  });

  socket.on('playCard', ({ room, player, card }) => {
    const game = games[room];
    const hand = game.hands[player];
    const topCard = game.discard[game.discard.length - 1];

    if (game.currentTurn !== player) return;
    if (!isValidPlay(card, topCard)) return;

    const idx = hand.findIndex(
      (c) => c.color === card.color && c.value === card.value
    );
    if (idx === -1) return;

    hand.splice(idx, 1);
    game.discard.push(card);

    const currentIndex = game.players.indexOf(player);
    game.currentTurn = game.players[
      (currentIndex + game.direction + 4) % 4
    ];

    io.to(room).emit('updateGame', {
      players: game.players,
      topCard: card,
      hand,
      currentTurn: game.currentTurn
    });

    if (hand.length === 0) {
      io.to(room).emit('message', `${player} wins the game!`);
      delete games[room];
    }
  });

  socket.on('drawCard', ({ room, player }) => {
    const game = games[room];
    if (game.currentTurn !== player) return;

    const newCard = drawCardFromDeck(game);
    game.hands[player].push(newCard);

    io.to(room).emit('updateGame', {
      players: game.players,
      topCard: game.discard[game.discard.length - 1],
      hand: game.hands[player],
      currentTurn: game.currentTurn
    });
  });

  socket.on('uno', ({ room, player }) => {
    io.to(room).emit('message', `${player} called UNO!`);
  });

  socket.on('chat', (msg) => {
    const room = Array.from(socket.rooms)[1];
    io.to(room).emit('chat', msg);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
    
