const timeDisplay = document.getElementById("timer-display");
const displayCircle = document.getElementById("timer-circle");
const redDisplay = document.getElementById("red-score");
const blueDisplay = document.getElementById("blue-score");
const redReveal = document.getElementById("red-reveal");
const blueReveal = document.getElementById("blue-reveal");
const fileInput = document.getElementById("file-input");

const start = new Audio("./sounds/start.mp3");
const end = new Audio("./sounds/endbuzzer.mp3");
const endgame = new Audio("./sounds/whistle.mp3");

start.preload = "auto";
end.preload = "auto";
endgame.preload = "auto";

// Button keymap
KEYMAP = [
  ["s", 0, 1],
  ["s", 0, -1],
  ["s", 1, 1],
  ["s", 1, -1],
  ["p", 0, 1],
  ["p", 0, -1],
  ["p", 1, 1],
  ["p", 1, -1],
];

var matchesJSON = null;
var matchNumber = 1;

// Red, blue
var points = [0, 0];
var penalties = [0, 0];

// load matches.json (the default example) if "use" is set to true
window.onload = function () {
  fetch("./matches.json")
    .then((text) => text.text())
    .then((json) => JSON.parse(json))
    .then((json) => {
      if (json.use == true) {
        matchesJSON = json;
        loadMatch(matchNumber);
      }
    });
};

fileInput.onchange = function () {
  reader = new FileReader();
  reader.readAsText(fileInput.files[0]);

  reader.onload = function () {
    try {
      matchesJSON = JSON.parse(reader.result);
      matchNumber = 1;
      loadMatch(matchNumber);
    } catch (error) {
      alert("Unable to parse file!");
    }
  };
};

document.addEventListener("keyup", (event) => {
  if (event.key == "r" && timePassed == initialTime) {
    toggleScores();
  } else if ("12345678".includes(event.key) && timePassed != 0) {
    let action = KEYMAP[parseInt(event.key) - 1];
    console.log(`${event.key}: ${action}`);
    if (action[0] == "s") {
      points[action[1]] = Math.max(0, points[action[1]] + action[2]);
    } else {
      penalties[action[1]] = Math.max(0, penalties[action[1]] + action[2]);
    }

    updateScore(false, points[0]);
    updateScore(true, points[1]);

    updatePenalties(false, penalties[0]);
    updatePenalties(true, penalties[1]);
  }
});

// seconds for timer
var initialTime = 135;
timeDisplay.innerHTML = formatDisplayTime(initialTime);

var timePassed = 0;
var timerInterval = null;

var redTitle = document.createElement("span");
redTitle.innerHTML = "Red";
var blueTitle = document.createElement("span");
blueTitle.innerHTML = "Blue";

redDisplay.appendChild(redTitle);
blueDisplay.appendChild(blueTitle);

document.addEventListener("keyup", (event) => {});

function formatDisplayTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return minutes + ":" + seconds;
}

function updateDisplayTime() {
  timeDisplay.innerHTML = formatDisplayTime(timeRemaining);
  --timeRemaining;
}

function startTimer() {
  if (timePassed == 0) {
    start.play();
  }

  timeDisplay.setAttributeNS(null, "fill", "white");

  if (timePassed != initialTime) {
    if (timerInterval == null) {
      timeDisplay.innerHTML = formatDisplayTime(initialTime - timePassed);
      changeCirclePercent();

      timerInterval = setInterval(() => {
        timePassed += 1;

        timeDisplay.innerHTML = formatDisplayTime(initialTime - timePassed);

        if (timePassed == initialTime) {
          stopTimer();
        }

        changeCirclePercent();

        if (initialTime - timePassed == 30) {
          endgame.play();
        } else if (initialTime - timePassed == 0) {
          end.play();
        }

        if (initialTime - timePassed <= 10) {
          displayCircle.classList = "circle-red";
          timeDisplay.classList.add("timer-end");
          void timeDisplay.offsetWidth;
        } else if (initialTime - timePassed <= 30) {
          displayCircle.classList = "circle-orange";
        } else {
          displayCircle.classList = "circle-green";
        }
      }, 1000);
    }
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  if (!timeDisplay.classList.contains("timer-end")) {
    timeDisplay.setAttributeNS(null, "fill", "yellow");
  }
}

function changeCirclePercent() {
  var rawTimeFraction = 1 - timePassed / initialTime;
  circleDashArray = (rawTimeFraction * 629).toFixed(0) + " 628";
  displayCircle.setAttributeNS(null, "stroke-dasharray", circleDashArray);
}

function resetTimer() {
  stopTimer();

  // if no loaded matches and timer is finished
  if (matchesJSON != null && timePassed == initialTime) {
    loadMatch(++matchNumber);
  }

  points = [0, 0];
  penalties = [0, 0];

  setTimeout(() => {
    updateScore(true, 0);
    updateScore(false, 0);

    updatePenalties(false, 0);
    updatePenalties(true, 0);
  }, 3000);

  timePassed = 0;
  displayCircle.setAttributeNS(null, "stroke-dasharray", "629 628");
  timeDisplay.classList.remove("timer-end");
  timeDisplay.setAttributeNS(null, "fill", "white");
  void timeDisplay.offsetWidth;
  displayCircle.classList = "circle-green";
  timeDisplay.innerHTML = formatDisplayTime(initialTime);
}

function updateScore(isBlue, score) {
  if (isBlue) {
    blueDisplay.innerHTML = "";
    blueDisplay.appendChild(blueTitle);
    blueDisplay.innerHTML += score;
  } else {
    redDisplay.innerHTML = "";
    redDisplay.appendChild(redTitle);
    redDisplay.innerHTML += score;
  }
}

function updatePenalties(isBlue, penalties) {
  if (isBlue) {
    document.getElementById("blue-penalties").innerHTML = penalties;
  } else {
    document.getElementById("red-penalties").innerHTML = penalties;
  }
}

function toggleTeams(resetScores) {
  if (redDisplay.classList.contains("red-score-enter")) {
    blueDisplay.classList.remove("blue-score-enter");
    redDisplay.classList.remove("red-score-enter");
    blueDisplay.classList.add("blue-score-exit");
    redDisplay.classList.add("red-score-exit");
  } else {
    blueDisplay.classList.remove("blue-score-exit");
    redDisplay.classList.remove("red-score-exit");
    blueDisplay.classList.add("blue-score-enter");
    redDisplay.classList.add("red-score-enter");
  }

  if (resetScores) {
    updateScore(true, 0);
    updateScore(false, 0);
  }
}

function toggleScores() {
  if (redReveal.classList.contains("red-reveal-enter")) {
    blueReveal.classList.remove("blue-reveal-enter");
    redReveal.classList.remove("red-reveal-enter");
    blueReveal.classList.add("blue-reveal-exit");
    redReveal.classList.add("red-reveal-exit");

    if (redReveal.children[0].id == "tied") {
      redReveal.removeChild(redReveal.firstChild);
    }
  } else {
    // update scores in reveal divs
    document.getElementById("red-reveal-points").innerHTML =
      points[0] - penalties[0];
    document.getElementById("red-reveal-penalties").innerHTML = penalties[0];
    document.getElementById("blue-reveal-points").innerHTML =
      points[1] - penalties[1];
    document.getElementById("blue-reveal-penalties").innerHTML = penalties[1];

    winnerDiv = document.createElement("div");
    winnerDiv.id = "winner";
    winnerDiv.innerHTML = "Winner!";

    if (redReveal.children.length == 2) {
      redReveal.removeChild(redReveal.firstChild);
    }

    if (blueReveal.children.length == 2) {
      blueReveal.removeChild(blueReveal.firstChild);
    }

    // Winner logic
    if (points[0] - penalties[0] > points[1] - penalties[1]) {
      redReveal.insertBefore(winnerDiv, redReveal.firstChild);
    } else if (points[0] - penalties[0] < points[1] - penalties[1]) {
      blueReveal.insertBefore(winnerDiv, blueReveal.firstChild);
    } else if (points[0] - penalties[0] == points[1] - penalties[1]) {
      if (penalties[0] < penalties[1]) {
        redReveal.insertBefore(winnerDiv, redReveal.firstChild);
      } else if (penalties[0] > penalties[1]) {
        blueReveal.insertBefore(winnerDiv, blueReveal.firstChild);
      } else {
        winnerDiv.id = "tied";
        winnerDiv.innerHTML = "Tied!";
        redReveal.insertBefore(winnerDiv, redReveal.firstChild);
      }
    }

    blueReveal.classList.remove("blue-reveal-exit");
    redReveal.classList.remove("red-reveal-exit");
    blueReveal.classList.add("blue-reveal-enter");
    redReveal.classList.add("red-reveal-enter");
  }
}

function loadMatch(number) {
    document
    .getElementById("match-selector")
    .classList.replace("no-matches", "matches");

  matchNumber = Math.max(
    Math.min(Object.keys(matchesJSON).join().match(/m/g).length, number),
    1
  );

  matchData = matchesJSON["m" + matchNumber];
  redTitle.innerHTML = matchData.red;
  blueTitle.innerHTML = matchData.blue;

  document.getElementById("red-reveal-name").innerHTML = matchData.red;
  document.getElementById("blue-reveal-name").innerHTML = matchData.blue;

  document.getElementById("match").innerHTML = "Match " + matchNumber;

  if (number == matchNumber) {
    toggleTeams(false);

    setTimeout(function () {
      toggleTeams(true);
    }, 2000);
  }

}
