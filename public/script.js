var turnCount, numPlayers;
let numPlayersScreen = getElementById('numPlayersScreen');
let setupScreen = getElementById('setupScreen');
let turnScreen = getElementById('turnScreen');

function main() {
  if (numPlayers) { 
    numPlayersScreen.style.display = "none";
  } else {
    numPlayersScreen.style.display = "block";
  }
}

// tbd
function newGameWith(number_of_players) {
  numPlayers = number_of_players
  setupScreen.style.display = "block";
  turnScreen.style.display = "block";
  turnCount = 0;
}

let setupForm = getElementById('setupForm');
function processSetupForm(event) {
  setupScreen.style.display = "none";
  turnScreen.style.display = "block";
  event.preventDefault();
}

let turnForm = getElementById('turnForm');
function processTurnForm(event) {
  event.preventDefault();
  turnScreen.style.display = "block";
  turnCount += 1;
}

main();
