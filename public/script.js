var turnCount, numPlayers;
let numPlayersScreen = document.getElementById('numPlayersScreen');
let setupScreen = document.getElementById('setupScreen');
let turnScreen = document.getElementById('turnScreen');

function main() {
  if (numPlayers) { 
    console.log("hiding numPlayers...");
    numPlayersScreen.style.display = "none";
  } else {
    console.log("showing numPlayers...");
    numPlayersScreen.style.display = "block";
  }
}

// tbd
function newGameWith(number_of_players) {
  numPlayers = number_of_players
  console.log("starting game w/ #{numPlayers}...")
  numPlayersScreen.style.display = "none";
  setupScreen.style.display = "block";
  turnScreen.style.display = "none";
  turnCount = 0;
}

let setupForm = document.getElementById('setupForm');
function processSetupForm(event) {
  event.preventDefault();
  numPlayersScreen.style.display = "none";
  setupScreen.style.display = "none";
  turnScreen.style.display = "block";
  return false;
}

let turnForm = document.getElementById('turnForm');
function processTurnForm(event) {
  event.preventDefault();
  turnScreen.style.display = "block";
  turnCount += 1;
  return false;
}

main();
