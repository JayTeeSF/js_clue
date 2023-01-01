// passing a 0 into any input-node should knock-out that node's activation
// 
// if we think from the perspective of the envelop (which this brain isn't necess. doing)
// 0 could mean it's NOT in the envelop (cuz someone else (or the board) has that card)
//

//let numberOfPlayersAndBoard = maxNumberOfPlayers + 1
// game-level inputs:
//        your cards (3 of 21)
//        board cards (6 of 21)
//        players (1's in 3 - 6 spots ...perhaps put a 10 in your spot ?!)
// input(s) per player-turn (not per-round):
//        mode (ask, show) (1 input set to 0 or 1)
//        who, what, where (3 of 21 cards set to 1), // only during Show mode
//        cardShown (upto 1 of 21 set to 1 --could all be 0-- which means we learned a lot)
//        askedByPlayer (1 of 6 inputs set to 1)
//        answeredByPlayer (1 of 6 inputs set to 1)
//
// output(s): cardsInEnvelop (3 of 21)
//            cardsToAsk     (3 of 21)
//            OR (based on mode)
//            cardsToShow    (3 of 21)

  // need inputs for every turn of the game,
  // but perhaps we can assume a reasonable game should be resolved within ?4-5? turns
  // it certainly shouldn't take more than 14 turns to discover the 12 unknown cards
  // when someone receives an answer after one or more players can't show a response
  // there's a knowledge-gain for everyone playing the game
  //
  // if the player after currentPlayer shows a card, then 0 units-of-knowledge is gained
  // if the player 2 after currentPlayer shows a card, then 1 unit-of-knowledge is gained
  // if the player 3 after currentPlayer shows a card, then 2 unit-of-knowledge is gained
  // etc
  // that said, it's always better for the main-player, if knowledge is learned
  // by the player just before that main-player, so there should be a discount (negative)
  // applied to knowledge gains based on how-far away they are from the main-player
  // as that gives more opportunity for someone else to win the game
  //
  // we should just let the neural network figure-this out, by giving it some semblance of:
  // who asked and who answered (i.e. the distance between them
  // ...and their distance from the main-player)
  // 
let totalNumberOfCards = 21
let numberOfModes = 2
let numberOfTurns = 5
let maxNumberOfPlayers = 6
let boardCt = 1
let yourCt = 1
let cardShownSize  = 1
let playerAskedSize  = 1
let playerAnsweredSize  = 1

let inputLayerSize = maxNumberOfPlayers +
  totalNumberOfCards * boardCt +
  totalNumberOfCards * yourCt +
  numberOfModes / 2 +
  totalNumberOfCards * numberOfTurns +
  totalNumberOfCards * cardShownSize + //        cardShown (upto 1 of 21 set to 1 --could all be 0-- which means we learned a lot)
  maxNumberOfPlayers * playerAskedSize + //        askedByPlayer (1 of 6 inputs set to 1)
  maxNumberOfPlayers * playerAnsweredSize; //        answeredByPlayer (1 of 6 inputs set to 1)

let hiddenLayerSize = Math.ceil(1.5 * inputLayerSize);
let outputLayerSize = totalNumberOfCards * ((numberOfModes / 2) + 1);

let layerSizes = [
  inputLayerSize,
  hiddenLayerSize,
  outputLayerSize
]
console.log(`layerSizes: ${layerSizes}`)


const myLocalStorage = {};

function load(key="bestBrain") {
  console.log("loading...");
  if (typeof localStorage === "undefined") {
    return myLocalStorage[key];
  } else {
    return localStorage.getItem(key);
  }
}

function save(key="bestBrain", brain) {
  console.log("saving...");
  if (typeof localStorage === "undefined") {
    myLocalStorage[key] = JSON.stringify(brain)
  } else {
    localStorage.setItem(
      key,
      JSON.stringify(brain)
    );
  }
}

function destroy(key="bestBrain") {
  console.log("destroying old best car...");
  if (typeof localStorage === "undefined") {
    delete myLocalStorage[key];
  } else {
    localStorage.removeItem(key);
  }
}

const mutateAmt = 0.27;
var brain;
let AIPlayers = [1]; // add 3 - 6 entries to this array ...or just 1 if we want to play it
let bestBrain = load("bestBrain");
if (bestBrain) {
  brain = JSON.parse(bestBrain);
} else {
  brain = new NeuralNetwork(layerSizes);
}

// 
//for(let i = 1; i<AIPlayers.length; i++) {
//NeuralNetwork.mutate(brain, mutateAmt);
//}

const inputs = []; // 187 decimals &/ ints...
const outputs = NeuralNetwork.feedForward(
  inputs, brain
);
// now use all 42 of the outputs output[0] ... output[41]

