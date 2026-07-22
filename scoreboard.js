let teamScores = [0, 0, 0, 0, 0, 0];
const matchTableHeaders = `
        <tr>
            <th>Match</th>
            <th>Red</th>
            <th>Blue</th>
            <th>Red Score</th>
            <th>Blue Score</th>
        </tr>`;

const matchTable = document.getElementById("match-table");
const teamTable = document.getElementById("team-table");
const scoreboard = document.getElementById("scoreboard");

teamMap = {}


document.addEventListener("keyup", (event) => {
  if (event.key == "b" && matchesJSON != null && timerInterval == null && (timePassed == 0 || timePassed == initialTime)) {
    toggleScoreboard();
    updateTeamScores();
  }
});

function toggleScoreboard() {
    scoreboard.classList.toggle("hidden");
}

function createScoreboard() {
  if (matchesJSON != null) {
    matchTable.innerHTML = matchTableHeaders;
    totalMatches = Object.keys(matchesJSON).join().match(/m\d+/g).length;
    teamMap = {}

    for (i = 0; i < totalMatches; ++i) {
        match = "m" + (i + 1);
        tr = document.createElement("tr");
        tr.id = match;
        tr.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${matchesJSON[match].red}</td>
                    <td>${matchesJSON[match].blue}</td>
                    <td id="${match + "r"}">
                    <div class="score-content">
                      <span>---</span>
                    </div>
                    </td>
                    <td id="${match + "b"}">
                    <div class="score-content">
                      <span>---</span>
                    </div>
                    </td> `;
        matchTable.appendChild(tr);

        if (teamMap[matchesJSON[match].red] === undefined) {
          teamMap[matchesJSON[match].red] = 0;
        }

        if(teamMap[matchesJSON[match].blue] === undefined) {
          teamMap[matchesJSON[match].blue] = 0;
        }
    }

    teamTable.innerHTML = "";

    tr = document.createElement("tr");
    Object.keys(teamMap).forEach(key => {
      th = document.createElement("th");
      th.innerHTML = key;
      tr.appendChild(th);
    });

    teamTable.appendChild(tr);

    tr = document.createElement("tr");

    Object.keys(teamMap).forEach(key => {
      td = document.createElement("td");
      td.id = key;
      td.innerHTML = "0";
      tr.appendChild(td);
    });

    teamTable.appendChild(tr);
  }
}

function updateTeamScores() {
  if(matchesJSON != null) {
    Object.keys(teamMap).forEach(key => {
      teamMap[key] = 0;
    });

    totalMatches = Object.keys(matchesJSON).join().match(/m\d+/g).length;
    for (i = 0; i < totalMatches; ++i) {
      match = "m" + (i + 1);
      if(matchesJSON[match].rs !== undefined) {
        teamMap[matchesJSON[match].red] += matchesJSON[match].rs;
      }

      if(matchesJSON[match].bs !== undefined) {
        teamMap[matchesJSON[match].blue] += matchesJSON[match].bs;
      }
    }

    Object.keys(teamMap).forEach(key => {
      document.getElementById(key).innerHTML = teamMap[key];
    });
  }
}

function createBracket() {
  if(matchesJSON != null) {
    if(confirm("Generating bracket will clear all other match data, do you wish to continue?")) {
      sortedTeams = Object.entries(teamMap).sort((a, b) => b[1] - a[1]);

      matchesJSON = {
        "m1": {
          "red": sortedTeams[0][0],
          "blue": sortedTeams[3][0]
        },
        "m2" : {
          "red": sortedTeams[1][0],
          "blue": sortedTeams[2][0]
        }, 
        "m3" : {
          "red" : "Winner of m1",
          "blue": "Winner of m2"
        },
        "m4" : {
          "red": "Winner of m1",
          "blue": "Winner of m2"
        },
        "m5": {
          "red": "Winner of m1",
          "blue": "Winner of m2"
        }
      }

      resetTimer();

      if(redReveal.classList.contains("red-reveal-enter")) {
        toggleScores();
      }

      matchNumber = 1;
      loadMatch(matchNumber);
      toggleScoreboard();
      createScoreboard();

      document.getElementById("bottom-table").classList.add("hidden");
    }
  }
}