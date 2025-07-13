// 📁 server/unoGame.js
const colors = ['Red', 'Green', 'Blue', 'Yellow'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const specials = ['Skip', 'Reverse', '+2'];

function generateDeck() {
  const deck = [];

  colors.forEach((color) => {
    numbers.forEach((num) => {
      deck.push({ color, value: num });
      if (num !== '0') deck.push({ color, value: num });
    });
    specials.forEach((special) => {
      deck.push({ color, value: special });
      deck.push({ color, value: special });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'Black', value: 'Wild' });
    deck.push({ color: 'Black', value: 'Wild+4' });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function drawCardFromDeck(game) {
  if (game.deck.length === 0) {
    game.deck = [...game.discard.slice(0, -1)];
    game.discard = [game.discard.at(-1)];
  }
  return game.deck.pop();
}

function isValidPlay(card, topCard) {
  return (
    card.color === topCard.color ||
    card.value === topCard.value ||
    card.color === 'Black'
  );
}

module.exports = { generateDeck, drawCardFromDeck, isValidPlay };
