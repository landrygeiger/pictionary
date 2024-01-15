# Game Loop

## States

1. Lobby

2. Round

- word
- time left

3. Between

- time left

## Actions

1. StartBetween

- As long as not ending or between, transition to between state
- (Eventually) reset all players back to not guessed

2. StartRound

- As long as not ending, transition to round state
- Choose new word

3. Tick

## How it's gonna work

1. Send start action from within lobby state
2. Reduce to "between" state

- But how do we make it count down?.
  - Could kick off a job that performs the count action a second later.

3. Reduce between state using count action
4. Count action reaches zero (or the thingy ends) and we reduce to the round
   state
5. do some more counting
6. Count action reaches zero (or the thingy ends) and we reduce to the between
   state RINSE AND REPEAT
