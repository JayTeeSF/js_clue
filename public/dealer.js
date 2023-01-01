// ok:
const NUM_SUSPECT_CARDS = 6;
const NUM_WEAPON_CARDS = 6;
const NUM_ROOM_CARDS = 9;
const NUM_TOTAL_CARDS = NUM_SUSPECT_CARDS + NUM_WEAPON_CARDS + NUM_ROOM_CARDS;

// Card constants for easy reference
const SUSPECT_CARDS = [1, 2, 3, 4, 5, 6];
const WEAPON_CARDS = [7, 8, 9, 10, 11, 12];
const ROOM_CARDS = [13, 14, 15, 16, 17, 18, 19, 20, 21];

if (typeof numPlayers === "undefined") {
  var numPlayers = 4;
}

// Initialize the board cards and player hands
let boardCards = [];
let playerHands = [[], [], [], []]; // make this dynamic based on number of Players

// Initialize the envelope
let envelope = [];

// Initialize the neural network
let neuralNetwork = new NeuralNetwork(); // see call.js

// Initialize the current player
let currentPlayer = 0;

// meh: see dealCards though...
// Main game loop
while (true) {
  // Check if the current player has won
  if (neuralNetwork.hasWon(playerHands[currentPlayer])) {
    // Mutate the winning neural network and reset the game
    neuralNetwork.mutate();
    resetGame();
  }
  
  // Get the current player's hand
  let currentHand = playerHands[currentPlayer];

  /*
  // Determine the most strategic cards to ask about
  let cardsToAsk = neuralNetwork.getCardsToAsk(currentHand, boardCards, envelope);
  
  // Determine the best card to show, if any
  let cardToShow = neuralNetwork.getCardToShow(cardsToAsk, currentHand);
  
  // If the current player has a card to show, show it
  if (cardToShow !== null) {
    showCard(cardToShow, currentPlayer);
    continue;
  }
  
  // Otherwise, ask about the cards
  let response = askCards(cardsToAsk, currentPlayer);
  
  // If the current player received a response, update the board
  if (response !== null) {
    boardCards.push(response);
    continue;
  }
  
  // If the current player did not receive a response, it is the next player's turn
  currentPlayer = (currentPlayer + 1) % numPlayers;
  */

    // Determine the most strategic cards to ask about or show
  let cardsToAskOrShow = neuralNetwork.getCardsToAskOrShow(
    currentHand,
    boardCards,
    envelope,
    currentPlayer,
    playerHands,
    turnHistory
  );

  // If the current player is the neural network's player, ask about the cards
  if (currentPlayer === neuralNetwork.playerIndex) {
    let response = askCards(cardsToAskOrShow, currentPlayer);

    // If the current player received a response, update the board and turn history
    if (response !== null) {
      boardCards.push(response);
      turnHistory.push({
        action: 'ask',
        cards: cardsToAskOrShow,
        response: response
      });
      continue;
    }
  }

  // Otherwise, show the cards
  showCards(cardsToAskOrShow, currentPlayer);

  // Update the turn history
  turnHistory.push({
    action: 'show',
    cards: cardsToAskOrShow
  });

  // If the current player did not receive a response or show a card, it is the next player's turn
  currentPlayer = (currentPlayer + 1) % 4;

}

// ok:
// Resets the game board and player hands
function resetGame() {
  boardCards = [];
  playerHands = [[], [], [], []];
  envelope = [];
  currentPlayer = 0;
  
  // Deal the cards to the players and stuff the envelope
  dealCards();
}

function dealCards() {
  // Initialize an array of all the cards
  let cards = [...SUSPECT_CARDS, ...WEAPON_CARDS, ...ROOM_CARDS];
  
  // Shuffle the cards
  shuffle(cards);
  
  // Stuff the envelope with a suspect, weapon, and room card
  envelope = [cards[0], cards[1], cards[2]];
  
  // Deal 6 random cards to the board
  boardCards = cards.slice(3, 9);
  
  // Deal the remaining cards to the players
  for (let i = 9; i < NUM_TOTAL_CARDS; i++) {
    playerHands[(i - 9) % numPlayers].push(cards[i]);
  }
}

