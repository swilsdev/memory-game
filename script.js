const BUTTONUP_DELAY = 200;
const TRANSITION_DELAY = 1500;
const NEXT_DELAY = 1000;
const TOTAL_SEQUENCE_LENGTH = 20;

/***************/
/*** Globals ***/
// memory pattern
var regionSequence = [];
// keeps track of timers for clearing
var timers = [];
// one mistake and game is over
var isStrict = false;
var playerSteps, totalSteps, disableBigButtons, isProcessingInput;

// pre-load images so they don't flicker on initial big button presses
var image0 = new Image();
image0.src = 'board_base.png';
var image1 = new Image();
image1.src = 'red_select.png';
var image2 = new Image();
image2.src = 'yellow_select.png';
var image3 = new Image();
image3.src = 'blue_select.png';
var image4 = new Image();
image4.src = 'green_select.png';

$(document).ready(function() {
  // if player clicks and drags off of #game div, treat it as mouseUp
  $('#game').mouseleave(function() {
    buttonUp();
  });
  // every click inside #game gets processed
  $('#game').mousedown(clicked);
  $('#game').mouseup(buttonUp);
  // button clicks in controls area
  $('#button-start-restart').click(bStartRestart);
  $('#button-checkbox').click(bCheckbox);
  resetBoard();
});

function updateDisplay(message) {
  $('#display').html(message);
}

function updateSteps(message) {
  $('#steps').html(message);
}

/******************/
/*** Game Logic ***/

function start() {
  disableBigButtons = true;
  updateDisplay('Memorize');
  displayPattern();
}

function resetBoard() {
  clearTimers();
  resetPlayerTurn();
  newPattern();
  // allows buttons to be pressed and heard before starting game
  disableBigButtons = false;
  isProcessingInput = false;
  totalSteps = 1;
  updateSteps(totalSteps);
  updateDisplay('Ready');
}

// resets display to beginning of sequence
function resetPlayerTurn() {
  playerSteps = 1;
}

function disableInput() {
  disableBigButtons = true;
  isProcessingInput = false;
}

function enableInput() {
  disableBigButtons = false;
  isProcessingInput = true;
}

function playerBegin() {
  updateDisplay('Go!');
  enableInput();
}

function clearTimers() {
  for(var i = 0; i < timers.length; i++) {
    clearTimeout(timers[i]);
  }
}

function newPattern() {
  // delete old pattern
  regionSequence.length = 0;
  // build new memory sequence
  var numChoices = 4;
  // add an extra element to sequence because player step starts at 1 not 0
  for (var i = 0; i < TOTAL_SEQUENCE_LENGTH + 1; i++) {
    var rNum = Math.floor(Math.random() * numChoices);
    var region = '';
    switch (rNum) {
      case 0:
        region = 'top';
        break;
      case 1:
        region = 'right';
        break;
      case 2:
        region = 'bottom';
        break;
      case 3:
        region = 'left';
        break;
    }
    regionSequence.push(region);
  }
}

function displayPattern() {
  disableInput();
  // seed with first step
  demoLoop(0);
}

function demoLoop(currentStep) {
  timers.push(setTimeout(function() {
    currentStep++;
    updateSteps(totalSteps);
    updateDisplay('Step ' + currentStep);
    if(currentStep <= totalSteps) {
      buttonDown(regionSequence[currentStep]);
      timers.push(setTimeout(buttonUp, BUTTONUP_DELAY));
      demoLoop(currentStep);
    }
    else {
      clearTimers();
      playerBegin();
    }
  }, NEXT_DELAY));
}

function checkPlay(button) {
  disableInput();
  updateDisplay('Step: ' + playerSteps);
  // if correct
  if (button == regionSequence[playerSteps]) {
    // if player has beaten the game
    if (playerSteps == TOTAL_SEQUENCE_LENGTH) {
      console.log('You Win!!');
      updateDisplay('You Win!!');
      timers.push(setTimeout(bStartRestart, TRANSITION_DELAY * 3));
    }
    // if player has successfully reached the end of the pattern
    else if (playerSteps == totalSteps) {
      // pattern was successfully repeated, increment pattern length
      totalSteps++;
      resetPlayerTurn();
      updateDisplay('Correct!');
      // display the next pattern
      timers.push(setTimeout(displayPattern, NEXT_DELAY));
    }
    else {
      playerSteps++;
      enableInput();
    }
  }
  // if wrong
  else {
    updateDisplay('Oops... ');
    // game over
    if (isStrict) {
      timers.push(setTimeout(function() {
        updateDisplay('Game over');
      }, TRANSITION_DELAY));
      timers.push(setTimeout(bStartRestart, TRANSITION_DELAY * 2));
    }
    // try again
    else {
      timers.push(setTimeout(function() {
        updateDisplay('Try again');
      }, TRANSITION_DELAY));
      resetPlayerTurn();
      timers.push(setTimeout(displayPattern, TRANSITION_DELAY * 2));
    }
  }
}

/***********************/
/*** Button Handlers ***/

// toggles button between 'Start' / 'Restart' and dispatches event
function bStartRestart() {
  var elem = $('#button-start-restart');
  var val = elem.prop('value');
  if (val == 'Start') {
    elem.prop('value', 'Restart');
    start();
  } else {
    elem.prop('value', 'Start');
    resetBoard();
  }
}

function bCheckbox() {
  isStrict = $('#button-checkbox').prop('checked');
}

// returns big buttons to unpressed appearance
function buttonUp() {
  $('#game').html('<img id="board" src="board_base.png"/>');
}

// changes board image to show button press and plays sound
function buttonDown(bigButton) {
  switch (bigButton) {
    case 'top':
      $('#game').html('<img id="board" src="red_select.png"/>');
      var elem = document.getElementById('sound1');
      // in case sound is already playing start it over for quick button presses
      elem.currentTime = 0;
      elem.play();
      break;
    case 'right':
      $('#game').html('<img id="board" src="yellow_select.png"/>');
      var elem = document.getElementById('sound2');
      elem.currentTime = 0;
      elem.play();
      break;
    case 'bottom':
      $('#game').html('<img id="board" src="blue_select.png"/>');
      var elem = document.getElementById('sound3');
      elem.currentTime = 0;
      elem.play();
      break;
    case 'left':
      $('#game').html('<img id="board" src="green_select.png"/>');
      var elem = document.getElementById('sound4');
      elem.currentTime = 0;
      elem.play();
      break;
    default:
      console.log('buttonDown->switch->default-ERROR');
  }
}

/**********************************/
/*** Big button click detection ***/

var region = {
  // anchor points are used to measure between them and mouse click
  top: {
    coords: [200, 80]
  },
  right: {
    coords: [320, 200]
  },
  bottom: {
    coords: [200, 320]
  },
  left: {
    coords: [80, 200]
  },
  center: {
    coords: [200, 200]
  },
  // button click belongs to anchor with shortest measurement
  closestAnchor: '',
  closestDistance: 1000,
  // reset distance to prepare algorithm for next click
  reset: function() {
    this.closestAnchor = '';
    this.closestDistance = 1000;
  }
};

function compareDistance(anchor, distance) {
  if (distance < region.closestDistance) {
    region.closestDistance = distance;
    region.closestAnchor = anchor;
  }
}

// use Pythagorem Theorem to get hypotenuse (straight line distance)
function getDistance(anchor, coords) {
  var xLen = Math.abs(anchor[0] - coords[0]);
  var yLen = Math.abs(anchor[1] - coords[1]);
  var distance = Math.sqrt(Math.pow(xLen, 2) + Math.pow(yLen, 2));
  return distance;
}

function clicked(evt) {
  var clickX = evt.offsetX;
  var clickY = evt.offsetY;
  var centerDistance = getDistance(region.center.coords, [clickX, clickY]);

  // make sure click is outside control area && expecting big button input
  if (centerDistance > 105 && !disableBigButtons) {
    var distance = getDistance(region.top.coords, [clickX, clickY]);
    compareDistance('top', distance);
    distance = getDistance(region.right.coords, [clickX, clickY]);
    compareDistance('right', distance);
    distance = getDistance(region.bottom.coords, [clickX, clickY]);
    compareDistance('bottom', distance);
    distance = getDistance(region.left.coords, [clickX, clickY]);
    compareDistance('left', distance);

    buttonDown(region.closestAnchor);
    if (!disableBigButtons && isProcessingInput) {
      checkPlay(region.closestAnchor);
    }
    // reset region
    region.reset();
  }
}
