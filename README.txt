call.js code should probably be added to script.js

mutate an initial brain and have those scripts play each other (?)
TBD(s):
1. automate the game setup
2. automate getting output from brain back into the UI
4. detect end of game...
3. profit!!
Thought(s):
1. Use NodeJS (w/o the web-UI) to enable training of the brain
2. store the brain in a JSON file
3. load the bestBrain using XHR from the server...

for each turn we want to supply all the data to the neural network for that turn
once the game is over, we want to reward the winning brain by
mutating it!!! :-o
