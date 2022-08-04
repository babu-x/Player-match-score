const express = require('express');
const app = express();
app.use(express.json());
module.exports = app;

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname,'cricketMatchDetails.db');

let db = null;

const initializeAndDbServer = async() => {
    try {
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        });
        app.listen(3000, () => {
        console.log('Server is running at http://localhost:3000/');
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1)
    }
};

initializeAndDbServer();

// GET /players/
app.get('/players/', async(request, response) => {
    const getPlayersQuery = `SELECT player_id as "playerId", player_name as "playerName" from player_details;`;
    const dbResponse = await db.all(getPlayersQuery);
    response.send(dbResponse);
});


// API 2
app.get('/players/:playerId/', async (request, response) => {
    const {playerId} = request.params;
    const getPlayerQuery = `SELECT player_id as "playerId", player_name as "playerName" FROM player_details
    WHERE playerId = '${playerId}';`;
    const dbResponse = await db.get(getPlayerQuery);
    response.send(dbResponse);
});

//API 3
app.put('/players/:playerId/', async(request, response) => {
    const {playerId} = request.params;
    const playerDetails = request.body;
    const {playerName} = playerDetails;
    const updateQuery = `UPDATE player_details
    SET 
    player_name = '${playerName}'
    WHERE player_id = '${playerId}';`;
    const dbResponse = await db.run(updateQuery);
    response.send('Player Details Updated');
});

// API 4
app.get('/matches/:matchId/', async (request, response) => {
    const {matchId} = request.params;
    const matchesQuery = `SELECT match_id as "matchId", match, year FROM match_details
    WHERE matchId = '${matchId}';`;
    const dbResponse = await db.get(matchesQuery);
    response.send(dbResponse);
});

//API 5
app.get('/players/:playerId/matches', async(request, response) => {
    const {playerId} = request.params;
    const getPlayerIdQuery = `SELECT match_id as "matchId", match, year FROM
    match_details  NATURAL JOIN player_match_score 
    WHERE player_id = '${playerId}';`;
    const dbResponse = await db.all(getPlayerIdQuery);
    response.send(dbResponse);
});

//API 6
app.get('/matches/:matchId/players', async(request, response) => {
    const {matchId} = request.params;
    const getQuery = `SELECT player_details.player_id as "playerId", player_details.player_name as "playerName"
    FROM player_match_score INNER JOIN player_details 
    ON player_match_score.player_id = player_details.player_id
    WHERE match_id = '${matchId}';`;
    const dbResponse = await db.all(getQuery);
    response.send(dbResponse);
});

//API 7
app.get('/players/:playerId/playerScores', async(request, response) => {
    const {playerId} = request.params;
    const getQuery = `SELECT player_details.player_id as "playerId",
    player_details.player_name as "playerName",
    player_match_score.score as "totalScore",
    player_match_score.fours as "totalFours",
    player_match_score.sixes as  "totalSixes"
    FROM 
    player_details INNER JOIN player_match_score
    ON player_details.player_id = player_match_score.player_id
    WHERE player_match_score.player_id = '${playerId}';`;
    const dbResponse = await db.get(getQuery);
    response.send(dbResponse);
});
