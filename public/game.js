if (typeof playerNames === "undefined") {
  var playerNames = ["p1", "p2", "p3", "p4"]
}
if (typeof numPlayers === "undefined") {
  var numPlayers = playerNames.length;
}

const NUM_SUSPECT_CARDS = 6;
const NUM_WEAPON_CARDS = 6;
const NUM_ROOM_CARDS = 9;
const NUM_TOTAL_CARDS = NUM_SUSPECT_CARDS + NUM_WEAPON_CARDS + NUM_ROOM_CARDS;

// Card constants for easy reference
const SUSPECT_CARDS = [1, 2, 3, 4, 5, 6];
const WEAPON_CARDS = [7, 8, 9, 10, 11, 12];
const ROOM_CARDS = [13, 14, 15, 16, 17, 18, 19, 20, 21];

class Game = {
  constructor(brain=nil) {
    this.setGame(brain);
  }

  setGame(brain=null) {
    // Initialize the board cards and player hands
    this.boardCards = [];
    this.players = [];
    for (let idx = 0; idx < numPlayers; idx++) {
      //make opponents
      // networkToMutate.mutate();
      players.append(new AiPlayer(playerNames[idx], this, idx))
    }

    // Initialize the envelope
    this.envelope = [];

    // Initialize the current player
    this.currentPlayerIdx = 0;
    this.currentPlayer = players[this.currentPlayerIdx];

    // Initialize the turn history
    this.turnHistory = [];

    // Deal the cards to the players and stuff the envelope
    this.dealCards();
  }

  // Main game loop
  mainGameLoop() { // perhaps each player should trigger a gameLoopIteration...
    while (true) { // can only use a game loop if we control the agent's request/response cycles
      this.gameLoopIteration()
    } // end Main game loop
  }

  gameLoopIteration() {
    // Check if the current player has won
    if (currentPlayer.makeGuessifCertain && currentPlayer.guess === this.envelope) {
      var brain = null;
      if (currentPlayer.hasBrain) {
        // Mutate the winning neural network and reset the game
        brain = currentPlayer.brain
        // .save...
      }
      setGame(brain);
      return;
    }

    // Determine the most strategic cards to ask about or show
    //if Show who, what, where
    var cardsToAskOrShow = currentPlayer.getCardsToAskOrShow(
      this.boardCards,
      this.currentPlayerIdx, // something about all other players
      this.numPlayers,

      this.turnHistory
    );

    // If the current player is an AI player, ask about the cards
    let response = currentPlayer.askCards(cardsToAskOrShow, currentPlayerIdx); //fixme: response is who, and possibly what...

    // If the current player received a response, update turn history
    if (response !== null) {
      //  boardCards.push(response);
      this.turnHistory.push({
        action: 'ask',
        cards: cardsToAskOrShow,
        response: response
      });
      // trim turnHistory to only maintain the last n-entries...
    }

    // Otherwise, show the cards
    showCards(cardsToAskOrShow, currentPlayerIdx);

    // Update the turn history
    this.turnHistory.push({
      action: 'show',
      cards: cardsToAskOrShow
    });
    // trim turnHistory to only maintain the last n-entries...
    // }

    // If the current player did not receive a response or show a card, it is the next player's turn
    this.currentPlayerIdx = (this.currentPlayerIdx + 1) % numPlayers;
  }

  // Sets the game board, player hands, and turn history

  dealCards() {
    // Initialize an array of all the cards
    let cards = [...SUSPECT_CARDS, ...WEAPON_CARDS, ...ROOM_CARDS];

    // Shuffle the cards
    this.shuffle(cards);

    // Stuff the envelope with a suspect, weapon, and room card
    this.envelope = [cards[0], cards[1], cards[2]];

    // Deal 6 random cards to the board
    this.boardCards = cards.slice(3, 9);

    // Deal the remaining cards to the players
    for (let i = 9; i < NUM_TOTAL_CARDS; i++) {
      // playerHands[(i - 9) % numPlayers].push(cards[i]);
      players[i].hand = 
        cards.slice(
          9 + i * (NUM_TOTAL_CARDS - 9) / players.length,
          9 + (i + 1) * (NUM_TOTAL_CARDS - 9) / players.length
        );
    }
  }
}

class Player = {
  // should we just pass the game object ?!
  constructor(name, game, gamePlayerIdx) {
    this.gamePlayerIdx = gamePlayerIdx;
    this.name = name;
    this.hand = [];
    this.guess = null;
  }
  makeGuess(suspect, weapon, room) {
    this.guess = [suspect, weapon, room];
  }
  makeGuessIfCertain() { 
    if (this.isCertain() && this.hasBrain()) {
      // this.getCardsToAsk(boardCards, numPlayers, turnHistory) {
      // askNetwork && this.makeGuess()
      return true;
    } else {
      return false;
    }
  }

  hasBrain() {
    return false;
  }

  getCardsToAsk(boardCards, numPlayers, turnHistory) {
    this.getCardsToAskOrShow(1, boardCards, numPlayers, turnHistory);
  }
  getCardsToShow: function(boardCards, numPlayers, turnHistory) {
    this.getCardsToAskOrShow(0, boardCards, numPlayers, turnHistory);
  }
  // is it best to do both ...and then decide?!
  getCardsToAskOrShow(mode, boardCards, numPlayers, turnHistory) {
    //use: this.hand, this.gamePlayerIdx
    return null;
  }
}

// Represents an AI player in the game
class AiPlayer extends Player {
  constructor(name, game, gamePlayerIdx, brain) {
    super(name, game, gamePlayerIdx);
    this.brain = brain;
  }

  hasBrain() {
    if (this.brain) { return true; } else { return false; }
  }

  getCardsToAskOrShow(mode, boardCards, numPlayers, turnHistory) {
    if (this.brain) {
      let inputs = [
        mode,
        this.hand,
        boardCards,
        this.gamePlayerIdx
        numPlayers,
        turnHistory
      ]
      return NeuralNetwork.feedForward(inputs, this.brain)
    } else {
      return null;
    }
  }
}
