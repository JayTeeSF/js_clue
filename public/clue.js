const Clue = {
  Card: class {
    get type() {
      return this._type
    };

    get name() {
      return this._name
    };

    constructor(type, name) {
      this._type = type;
      this._name = name.toString()
    };

    get toS() {
      return this._name
    };

    get toSym() {
      return toString().toSym
    }
  },

  Player: class {
    get name() {
      return this._name
    };

    get doesNotHave() {
      return this._doesNotHave
    };

    get has() {
      return this._has
    };

    get colSize() {
      return this._colSize
    };

    constructor(name, colSize=null) {
      this._name = name.toString();
      this._colSize = colSize || TXT_COL_SIZE;
      this._doesNotHave = new Set([]);
      this._has = new Set([]);
      this._hasAtLeastOneOf = new Set([])
    };

    get clearPossibilities() {
      return this._hasAtLeastOneOf.clear
    };

    get possibilities() {
      return this._hasAtLeastOneOf
    };

    get possibilitiesToS() {
      let list = this.possibilities.reduce([], (ary, possibility) => {
        ary.push(`who: ${(possibility.who || "").padEnd(this.colSize, " ")} where: ${(possibility.where || "").padEnd(
          this.colSize,
          " "
        )} what: ${(possibility.what || "").padEnd(this.colSize, " ")}`);

        return ary
      });

      return list.join("\n\t\t")
    };

    get possibilitiesToJson() {
      return this.possibilitiesToS
    };

    // trim by what we know we do NOT have
    trimByWhatIsKnown(card) {
      return this.doesNotHave.includes(card) ? null : card
    };

    // prefilter these cards against all other known cards:
    // board_cards,
    // your_cards,
    // revealed_cards, <-- distinguish this players own reveal cards!!!
    // does_not_have filter too...
    //
    // Simplified:
    // JUST FILTER THESE BY YOUR OWN DONT_HAVE SET <-- which automatically gets updated when other players reveal, or the board, or I have something!
    hasAtLeastOneOf(whoCard, whatCard, whereCard) {
      whoCard = this.trimByWhatIsKnown(whoCard);
      whatCard = this.trimByWhatIsKnown(whatCard);
      whereCard = this.trimByWhatIsKnown(whereCard);
      let trimmedCards = [whoCard, whatCard, whereCard].filter(function (obj) { return obj });
      let numTrimmedCards = trimmedCards.size;

      if (1 == numTrimmedCards) {
        console.warn(`ONLY one card, so user MUST have this card: ${trimmedCards.map(item => (
          item.name
        ))}`);

        this.has = trimmedCards[0];
        return
      } else if (numTrimmedCards < 1) {
        console.warn(`NO CARDS to add: ${trimmedCards.map(item => item.name)}`);
        return
      };

      // No need to avoid adding a list that we already have, cuz this is a Set!
      let whoCardName = whoCard?.name.toLowerCase;
      let whatCardName = whatCard?.name.toLowerCase;
      let whereCardName = whereCard?.name.toLowerCase;

      // jj wants to intersect all the facts in this Set <-- not yet
      let possibility = {};
      if (whoCard) possibility.who = whoCardName;
      if (whatCard) possibility.what = whatCardName;
      if (whereCard) possibility.where = whereCardName;
      return this._hasAtLeastOneOf << possibility
    };

    // does_not_have # the card
    set does_not_have(card) {
      //let got = this._has & [card];
      return this._has.has(card) ? console.warn(`Unable to mark card(${card.name}) as NOT belonging to ${this.name}; ${got}`) : this._doesNotHave << card 
    };

    set has(card) {
      //let got = this._doesNotHave & [card];
      return this._doesNotHave.has(card) ? console.warn(`Unable to assign card(${card.name}) to ${this.name}; ${got}`) : this._has << card 
    };

    get toS() {
      return this._name
    };

    get toSym() {
      return toString().toSym
    }
  },

  // Logic:
  // mark what you SEE (cuz the board shows it, you have it, or someone shows you)
  // mark what you know they DON'T HAVE (based on when they can't answer a question)
  // make deductions (when possible) based on those facts PLUS the fact that everyone has <cards_per_player> cards
  // Clue::Solver.cards
  // => Clue::Solver.who_cards
  // => Clue::Solver.what_cards
  // => Clue::Solver.where_cards
  // Clue::Solver.expected_board_card_count(num_players) # try-out different numbers of players
  // Clue::Solver.calc_cards_per_player(num_players)
  // cs = new(your_name, ordered_names=[], skip_log: true, board_cards_showing: [], your_cards: [])
  // cs.remove_board_and_your_cards_from_opponents
  // # when take_another_turn is false, just call for 'solution'
  // cs.take_another_turn?
  // cs.info(:json).merge(
  //   next_player_name: cs.current_player,
  //   am_i_the_next_player: your_the_current_player?
  // )
  // cs.solution
  //require("set");

  Solver: class {
    static get whoCards() {
      return WHO.map(who => new Card("who", who))
    };

    static get whoCardNames() {
      return whoCards.map(item => item.name)
    };

    static get whatCards() {
      return WHAT.map(what => new Card("what", what))
    };

    static get whatCardNames() {
      return whatCards.map(item => item.name)
    };

    static get whereCards() {
      return WHERE.map(where => new Card("where", where))
    };

    static get whereCardNames() {
      return whereCards.map(item => item.name)
    };

    static get cards() {
      return whoCards + whatCards + whereCards
    };

    static get cardNames() {
      return this.cards.map(item => item.name)
    };

    static get totalCardCount() {
      return this.cards.size
    };

    static calcCardsPerPlayer(numPlayers) {
      return (totalCardCount - expectedBoardCardCount(numPlayers)) / numPlayers
    };

    static expectedBoardCardCount(numPlayers) {
      return FACE_UP_CARDS_PER_PLAYER_CT[numPlayers]
    };

    static findPlayerByName(playerName, players) {
      return players.find(p => p.name.toLowerCase == playerName.toLowerCase)
    };

    log(logLine) {
      return
    };

    get players() {
      return this._players
    };

    get cards() {
      return this._cards
    };

    get yourCards() {
      return this._yourCards
    };

    get boardCards() {
      return this._boardCards
    };

    get cardsPerPlayer() {
      return this._cardsPerPlayer
    };

    get currentPlayer() {
      return this._currentPlayer
    };

    constructor(yourName, orderedNames=[], { outputFile=null, inputFile=null, skipLog=false, boardCardsShowing=null, yourCards=null } = {}) {
      // the solver becomes "certain" at the point that it has exactly _one_ who, _one_ what, and _one_ where...
      this._uncertain = true;
      this._outputFile = null;
      this._inputFile = null;
      this._yourName = yourName;
      if (IsStrBlank(yourName)) this.help("missing your_name");
      this._numberOfPlayers = orderedNames.size;
      this.validatePlayerCounts(this._numberOfPlayers);
      this.setupCards;
      this.setupPlayers(orderedNames);
      this._currentPlayer = this._players[0];
      this.nextPlayer = this._currentPlayer;
      this._yourCards = yourCards;
      this._boardCards = boardCardsShowing;
      this._turn = 0
    };

    set next_player(val) {
      this._nextPlayer = val;
      return this._nextPlayer
    };

    get nextPlayer() {
      return this._nextPlayer
    };

    get removeBoardAndYourCardsFromOpponents() {
      if (!this._removeBoardAndYourCardsFromOpponents) {
        this._cardsPerPlayer = this.class.calcCardsPerPlayer(this._numberOfPlayers);
        this._cardsPerPlayer = this._cardsPerPlayer || (this.class.totalCardCount / this._numberOfPlayers);
        this.boardCards;
        this.yourCards;

        // remove board_cards & your_cards from each player's hand
        for (let player of this.opponentPlayers) {
          for (let c of this.impossibleCards) {
            player.doesNotHave = c
          }
        };

        this._removeBoardAndYourCardsFromOpponents = true
      };

      return this._removeBoardAndYourCardsFromOpponents
    };

    get solve() {
      this.removeBoardAndYourCardsFromOpponents;

      while (isTakeAnotherTurn) {

      };
      return this.solution
    };

    get solution() {
      return `It was ${this.who[0].name.capitalize} in the ${this.where[0]} with the ${this.what[0]}`
    };

    certain() {
      return !this._uncertain
    };

    isTakeAnotherTurn(whoAsked=null, whatAsked=null, whereAsked=null, namesOfPlayersWhoDoNotHaveTheseCards=null, playerWhoShowedYouACard=null, cardPlayerShowedYou=null, nameOfPlayerWhoHasOneOfTheseCards=null) {
      // stop if done:
      if (certain) return false;
      if (this._turn == 0) console.warn("\nStarting the game...\n");
      this._currentPlayer = this.nextPlayer;

      this.playATurn(
        whoAsked,
        whatAsked,
        whereAsked,
        namesOfPlayersWhoDoNotHaveTheseCards,
        playerWhoShowedYouACard,
        cardPlayerShowedYou,
        nameOfPlayerWhoHasOneOfTheseCards
      );

      this._uncertain = this.who.size > 1 || this.what.size > 1 || this.where.size > 1;
      this._turn++;
      this.nextPlayer = this._players[this._turn % this._numberOfPlayers];

      if (almostCertain = this.who.size <= 2 && this.what.size <= 2 && this.where.size <= 2) {
        console.warn("\tAlmost certain on all fronts!!!\n")
      };

      return this._uncertain
    };

    playATurn(whoAsked=null, whatAsked=null, whereAsked=null, namesOfPlayersWhoDoNotHaveTheseCards=null, playerWhoShowedYouACard=null, cardPlayerShowedYou=null, nameOfPlayerWhoHasOneOfTheseCards=null) {
      if (yourTheCurrentPlayer) {
        // TBD: add some info about what players *may* have, but I'm uncertain about... (i.e. probability)
        // tbd: can we deduce what they likely have?
        // use player.has_one_of(s) in comparison with what's been revealed by other players in order to create shorter lists of has_one_of(s)
        // e.g. player-1 has_one_of: who, what, where until we know someone else has that "what", so we make a new fact that says, player-1.has_one_of who, where
        // until we can ultimately narrow it down to a single card ...at which point we move that card to their "has" list!!
        //
        // tbd: store data in knowledge-base (using either propositional logic or (if nec. first-order logic) in Conjunctive Normal Form: conjunction of disjunctive clauses), and have knowledge-base solve for new propositions
        console.warn(this.info("pre"))
      };

      if (!whoAsked || !whatAsked || !whereAsked) console.warn("missing input param cards");
      let whoCard = this.cardNamed(whoAsked);
      let whatCard = this.cardNamed(whatAsked);
      let whereCard = this.cardNamed(whereAsked);

      if (yourTheCurrentPlayer) {
        if (IsStrBlank(playerWhoShowedYouACard)) playerWhoShowedYouACard = null;

        if (playerWhoShowedYouACard) {
          if (IsStrBlank(cardPlayerShowedYou)) cardPlayerShowedYou = null
        }
      } else if (IsStrBlank(nameOfPlayerWhoHasOneOfTheseCards)) {
        nameOfPlayerWhoHasOneOfTheseCards = null
      };

      for (let player of this.opponentsOf(this.currentPlayer)) {
        if (namesOfPlayersWhoDoNotHaveTheseCards.map(item => item.toLowerCase()).includes(player.name.toLowerCase)) {
          player.doesNotHave = whoCard;
          player.doesNotHave = whatCard;
          player.doesNotHave = whereCard
        };

        if (yourTheCurrentPlayer) {
          //   handle case where you were actually shown a specific card, by a single player...
          if (cardPlayerShowedYou && playerWhoShowedYouACard.toLowerCase == player.name.toLowerCase) {
            player.has = this.cardNamed(cardPlayerShowedYou)
          }
        }
      };

      this.updatePlayerWhoShowedACard(
        nameOfPlayerWhoHasOneOfTheseCards,
        whoCard,
        whatCard,
        whereCard
      );

      // update all the facts...
      for (let player of this.opponentPlayers) {
        this.updateWhatPlayerDoesNotHave(player);

        // augment existing knowledge first ...and again afterwards, in case we learned something new ?!
        // update our guesses as to what this player has based on the latest evidence:
        // TODO 1: possibilities = player.possibilities
        // TODO 2: player.clear_possibilities
        // TODO 3: re-add each possibility
        this.reEvaluatePossibilitiesFor(player)
      };

      if (yourTheCurrentPlayer) return console.warn(this.info("post"))
    };

    updatePlayerWhoShowedACard(nameOfPlayer, whoCard, whatCard, whereCard) {
      //name_of_player... could be "nobody"
      let player = this.class.findPlayerByName(
        nameOfPlayer.toLowerCase,
        this.opponentPlayers
      );

      if (!player) {
        // console.warn("Unable to find player named: #{name_of_player.inspect} (in players: #{opponent_names.inspect}), who showed a card to our opponent; FIXME: if it wasn't YOU!")
        return
      };

      this.updateWhatPlayerDoesNotHave(player);
      return player.hasAtLeastOneOf(whoCard, whatCard, whereCard)
    };

    updateWhatPlayerDoesNotHave(player) {
      let otherPlayersCards = this.revealedCards({exceptFromPlayer: player});

      for (let c of this.impossibleCards + otherPlayersCards.toA) {
        player.doesNotHave = c
      }
    };

    reEvaluatePossibilitiesFor(player) {
      let possibilities = player.possibilities.dup;
      player.clearPossibilities;

      for (let possibility of possibilities) {
        let whoCard = this.cardNamed(possibility.who);
        let whatCard = this.cardNamed(possibility.what);
        let whereCard = this.cardNamed(possibility.where);

        // re-add it
        player.hasAtLeastOneOf(whoCard, whatCard, whereCard)
      }
    };

    // list
    revealedCards({ exceptFromPlayer=null } = {}) {
      // loop over each opponent player object and look at the cards we KNOW they have..
      let _cards = new Set([]);

      let playerList = exceptFromPlayer ? this.opponentsOf(
        exceptFromPlayer,
        this.yourPlayer
      ) : this.opponentPlayers;

      for (let player of playerList) {
        for (let c of player.has) {
          _cards.push(c)
        }
      };

      return _cards
    };

    // data-structure -- debug output
    get cardsRevealedByPlayers() {
      return this.opponentPlayers.reduce({}, (m, p) => {
        m[p.name] = p.has.map(item => item.name);
        return m
      })
    };

    // for now don't display anything ...cuz it's probably too verbose!
    maybeImpossibilities(mode) {
      switch (mode) {
        case "all":
          return `And they don't have:\n\t${this.playerImpossibilities.bind(this)}\n`;

        case "json":
          return `And they don't have:\n\t${this.playerImpossibilities(mode)}\n`;

        default:
          return ""
      }
    };

    // data-structure -- debug output
    playerImpossibilities(mode="string") {
      let list;

      if ("string" == mode) {
        list = this.opponentPlayers.reduce([], (ary, p) => {
          ary.push(`${p.name}:\n\t\t${p.doesNotHave}`);
          return ary
        });

        return list.join("\n\t")
      } else {
        return this.opponentPlayers.reduce([], (ary, p) => {
          ary.push({[p.name]: p.doesNotHave.map(c => c.name)});
          return ary
        })
      }
    };

    // data-structure -- debug output
    playerPossibilities(mode="string") {
      let list;

      if ("string" == mode) {
        list = this.opponentPlayers.reduce([], (ary, p) => {
          ary.push(`${p.name}:\n\t\t${p.possibilitiesToS}`);
          return ary
        });

        return list.join("\n\t")
      } else {
        return this.opponentPlayers.reduce([], (ary, p) => {
          ary.push({[p.name]: p.possibilitiesToJson});
          return ary
        })
      }
    };

    // if everybody has some cards in their does_not_have list(s) then it's certain (not uncertain) what the answer is
    // assuming that card was _also_ in the possible list (i.e. no user has the board cards, but board cards are already rejected from the possible list)
    //
    // don't get confused by the person who gives AN answer but has multiple answers that we don't know about...
    certainOf(possible=[]) {
      let certain = new Set(possible);
      let msgs = [];

      //msgs << "certain_of(#{certain.map(&:name)}): "
      for (let player of this._players) {
        // use a set operation (intersection) to get the overlap:
        certain = certain & player.doesNotHave;

        //msgs << "player #{player.name} doesn't have: #{player.does_not_have.map(&:name)} => #{certain.map(&:name)}"
        if (certain.length == 0) break
      };

      return certain
    };

    get impossibleCards() {
      return (this.boardCards || []) + (this.yourCards || [])
    };

    get who() {
      // from perspective of the envelope
      let possible = this._whoCards.reject(c => this.impossibleCards.includes(c));
      possible = possible.reject(c => this.revealedCards.bind(this).includes(c));
      let got = this.certainOf(possible);
      return got.length == 0 ? possible : got
    };

    get what() {
      // from perspective of the envelope
      let possible = this._whatCards.reject(c => this.impossibleCards.includes(c));
      possible = possible.reject(c => this.revealedCards.bind(this).includes(c));
      let got = this.certainOf(possible);
      return got.length == 0 ? possible : got
    };

    get where() {
      // from perspective of the envelope
      let possible = this._whereCards.reject(c => this.impossibleCards.includes(c));
      possible = possible.reject(c => this.revealedCards.bind(this).includes(c));
      let got = this.certainOf(possible);
      return got.length == 0 ? possible : got
    };

    set board_cards(_cardNames) {
      return this._boardCards = this._boardCards || this.cards.filter(c => (
        _cardNames.map(item => item.toLowerCase()).includes(c.name.toLowerCase)
      ))
    };

    get opponentNames() {
      return this.opponentsOf(this.currentPlayer, this.yourPlayer).map(item => (
        item.name
      ))
    };

    get opponentPlayers() {
      return this._opponentPlayers = this._opponentPlayers || this._players.reject(p => (
        p.name == this._yourName
      ))
    };

    get yourPlayer() {
      return this._yourPlayer = this._yourPlayer || this.class.findPlayerByName(
        this._yourName,
        this._players
      )
    };

    opponentsOf(somePlayer, except=null) {
      let startingIndex = this._players.indexOf(somePlayer) + 1;
      let endingIndex = startingIndex + this._numberOfPlayers - 1 - 1;

      let opps = this.range(startingIndex, endingIndex).map(playerIdx => (
        this._players[playerIdx % this._numberOfPlayers]
      )) - [except];

      return opps
    };

    range(from, to) {
      let res = [];
      let i = from;

      while (true) {
        res.push(i);
        i++;
        if (i > to) break
      };

      return res
    };

    yourTheCurrentPlayer() {
      return this.currentPlayer.name == this._yourName
    };

    set your_cards(_cardNames) {
      if (!this._yourCards) {
        this._yourCards = this.cards.filter(c => (
          _cardNames.map(item => item.toLowerCase()).includes(c.name.toLowerCase)
        ));

        // set your_player#has:
        for (let c of this._yourCards) {
          this.yourPlayer.has = c
        };

        // set all the cards your player does not have:
        for (let c of this.cards - this._yourCards) {
          this.yourPlayer.doesNotHave = c
        }
      };

      return this._yourCards
    };

    get cardNames() {
      return this.class.cardNames
    };

    cardNamed(cardName) {
      if (!cardName) return;
      return this.cards.find(c => c.name.toLowerCase == cardName.toLowerCase)
    };

    get cards() {
      return this._cards = this._cards || this.class.cards
    };

    info(mode="pre") {
      let prefix = (() => {
        switch (mode) {
          case "pre":
            return "\nYour turn to figure-out what's in the envelope. You have:";

          case "post":
            return "\nAfter your turn you have:";

          case "all":
            return "\nYou have:";

          default:
            return "\nYou have:"
        }
      })();

      return "json" == mode ? {
        youHave: this.currentPlayer.has.map(item => item.name),
        theBoardShows: this.boardCards.map(item => item.name),
        otherPlayersHaveShownYou: this.cardsRevealedByPlayers,

        otherPlayersAlsoHave: [
          this.playerPossibilities(mode),
          this.maybeImpossibilities(mode)
        ],

        youAreLookingFor: {
          whoCount: this.who.size,
          whos: this.who.map(item => item.name),
          whatCount: this.what.size,
          whats: this.what.map(item => item.name),
          whereCount: this.where.size,
          wheres: this.where.map(item => item.name)
        }
      } : `${prefix}
\t${this.currentPlayer.has.map(item => item.name)}
The board shows:
\t${this.boardCards.map(item => (
  item.name
))}
Other players have shown you:
\t${JSON.stringify(this.cardsRevealedByPlayers)}
Plus they have one or more of the following:
\t${this.playerPossibilities.bind(this)}
    ${this.maybeImpossibilities(mode)}And you're looking for the:
\t(${this.who.size})who(s): ${this.who.map(item => (
  item.name
))}, 
\t(${this.what.size})what(s): ${this.what.map(item => item.name)}, 
\t(${this.where.size})where(s): ${this.where.map(item => (
  item.name
))}
`
    };

    isBlank(obj) {
      return strBlank(obj) || aryBlank(obj)
    };

    isStrBlank(str) {
      return str == null || str == "" || str == " "
    };

    isAryPresent(ary) {
      return !aryBlank(ary)
    };

    isAryBlank(ary) {
      return [null, []].includes(ary)
    };

    printWarn(msg) {
      return console.warn(msg)
    };

    IsNotEnough(limitedOptions=[{options: [], stopAt: 0, responses: []}]) {
      return limitedOptions.some(h => h.responses.size < h.stopAt)
    };

    allFrom(limitedOptions=[{options: [], stopAt: 0, responses: []}], key) {
      return limitedOptions.flatMap(o => o[key])
    };

    allResponsesFrom(limitedOptions=[{
      options: [],
      stopAt: 0,
      responses: []
    }]) {
      return this.allFrom(limitedOptions, "responses")
    };

    allOptionsFrom(limitedOptions=[{
      options: [],
      stopAt: 0,
      responses: []
    }]) {
      return this.allFrom(limitedOptions, "options")
    };

    setupPlayers(orderedPlayerNames) {
      this._players = orderedPlayerNames.map(n => (
        new Player(n, this.cards.map(c => c.name.length).max)
      ));

      return this._players
    };

    get setupCards() {
      this._whoCards = this.class.whoCards;
      this._whatCards = this.class.whatCards;
      this._whereCards = this.class.whereCards;
      return this._whereCards
    };

    get orderedPlayerNames() {
      return this._orderedPlayerNames = this._orderedPlayerNames || this._players.map(item => (
        item.name
      ))
    };

    help(msg) {
      let helpMsg = `
        ${msg}

      Usage: ${$PROGRAM_NAME} <your_name> <first_player*> <second_player*> ...<nth_player*>
        *Note: Be sure to repeat <your_name> in the order you show-up in the line-up.

        e.g.: ${$PROGRAM_NAME} "Me" "player-1" "Me" "player-3" "player-4"
`;
      // console.warn(helpMsg)
      throw new Error(helpMsg);
    };

    validatePlayerCounts(count) {
      if (count < 3) this.help("must have at least 3 players");
      if (count > 6) return this.help("must have at most 6 players")
    }
  },

  TXT_COL_SIZE: 11,

  THE_BOARD: "the board",

  WHO: [
    "green",
    "mustard",
    "peacock",
    "plum",
    "scarlet",
    "white"
  ],

  WHAT: [
    "candlestick",
    "dagger",
    "pistol",
    "leadPipe",
    "rope",
    "wrench"
  ],

  WHERE: [
    "bathroom",
    "bedroom",
    "courtyard",
    "diningRoom",
    "gameRoom",
    "garage",
    "kitchen",
    "livingRoom",
    "office"
  ],

  CLASSIC_FACE_UP_CARDS_PER_PLAYER_CT: {
    [3]: 0,
    [4]: 2,
    [5]: 3,
    [6]: 0
  },

  FACE_UP_CARDS_PER_PLAYER_CT: {[3]: 6, [4]: 6, [5]: 3, [6]: 6}
}
