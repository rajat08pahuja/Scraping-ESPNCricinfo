let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let resultsUrl = url + '/match-results'; 
request(resultsUrl, cb); // directly requesting the results page

function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        let chSelector = cheerio.load(html);

        let eachMatchScorecardElement = chSelector('.match-score-block .match-cta-container a[data-hover = Scorecard]');

        let iplMainDir = path.join(__dirname, "IPL 2020-21"); 

        // creating directory IPL 2020-21
        if (fs.existsSync(iplMainDir) == false) {
            fs.mkdirSync(iplMainDir);
        }

        // requesting all the match scorecard pages
        for (let i = 0; i < eachMatchScorecardElement.length; i++) {
            let eachMatchLink = "https://www.espncricinfo.com" + chSelector(eachMatchScorecardElement[i]).attr('href');
            request(eachMatchLink, cb1);
        }
    }
}

function cb1(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        // Getting the match info and team names in objects
        let matchInfo = { venue: "", date: "" };
        let firstTeam = { name: "", status: "" };
        let secondTeam = { name: "", status: "" };
        
        let chSelector = cheerio.load(html);

        // extracting the match description
        let matchInfoArr = chSelector('.event .match-info.match-info-MATCH .description').text().split(',');
        matchInfo.venue = matchInfoArr[1].trim();
        matchInfo.date = matchInfoArr[2].trim();

        // losing team has class 'team-gray' with it. so finding the team which lost the match
        let losingTeam = chSelector('.event .teams .team-gray a.name-link .name').text();

        let bothTeamNamesElement = chSelector('.event .teams .team a.name-link .name'); // getting both team names

        if (losingTeam.length == 0) {
            // in case there is a tie there will be no losing team.
            firstTeam.name = chSelector(bothTeamNamesElement[0]).text();
            secondTeam.name = chSelector(bothTeamNamesElement[1]).text();
            firstTeam.status = secondTeam.status = "Tie";
        } else {
            if (chSelector(bothTeamNamesElement[0]).text() == losingTeam) {
                // if first team name is equal to the losing team name
                firstTeam.name = losingTeam;
                firstTeam.status = "Lost";
                secondTeam.name = chSelector(bothTeamNamesElement[1]).text();
                secondTeam.status = "Won";
            } else {
                // if second team name is equal to the losing team name
                firstTeam.name = chSelector(bothTeamNamesElement[0]).text();
                firstTeam.status = "Won";
                secondTeam.name = losingTeam;
                secondTeam.status = "Lost";
            }
        }

        firstTeamDir = path.join(__dirname, "IPL 2020-21", firstTeam.name);
        secondTeamDir = path.join(__dirname, "IPL 2020-21", secondTeam.name);

        // Creating directories for both the teams
        if (fs.existsSync(firstTeamDir) == false) {
            fs.mkdirSync(firstTeamDir);
        }

        if (fs.existsSync(secondTeamDir) == false) {
            fs.mkdirSync(secondTeamDir);
        }

        // Extracting the batsman table for both the teams
        let tableElement = chSelector('.Collapsible .table.batsman');
        for (let i = 0; i < tableElement.length; i++) {
            // if i == 0 we are having firstteam and if i == 1 we are having second team
            let currTeamName = (i == 0) ? firstTeam.name : secondTeam.name;

            // Getting each rows inside each table
            let table = chSelector(tableElement[i]).find('tbody tr');

            for (let j = 0; j < table.length - 1; j += 2) {
                let tabledata = chSelector(table[j]).find('td');

                // Getting the data for each batsman
                let batsmanName = chSelector(tabledata[0]).find('a').text().trim();
                let batsmanStatus = chSelector(tabledata[1]).find('span').text().trim();
                let batsmanRuns = chSelector(tabledata[2]).text().trim();
                let batsmanBalls = chSelector(tabledata[3]).text().trim();
                let batsman4s = chSelector(tabledata[5]).text().trim();
                let batsman6s = chSelector(tabledata[6]).text().trim();
                let batsmansr = chSelector(tabledata[7]).text().trim();

                // batsmanObj will be used to update the already created json file
                let batsmanObj = {
                    date : matchInfo.date,
                    opponent : (i == 0) ? secondTeam.name : firstTeam.name, 
                    venue : matchInfo.venue,
                    result : (i == 0) ? firstTeam.status : secondTeam.status,
                    runs: batsmanRuns,
                    balls: batsmanBalls,
                    fours: batsman4s,
                    sixes: batsman6s,
                    strikerate: batsmansr,
                    status : batsmanStatus
                };

                // bastmanArr will be used in case the json file for the batsman is created for the first time
                let batsmanArr = [{
                    date : matchInfo.date,
                    opponent : (i == 0) ? secondTeam.name : firstTeam.name, 
                    venue : matchInfo.venue,
                    result : (i == 0) ? firstTeam.status : secondTeam.status,
                    runs: batsmanRuns,
                    balls: batsmanBalls,
                    fours: batsman4s,
                    sixes: batsman6s,
                    strikerate: batsmansr,
                    status : batsmanStatus
                }];


                batsmanFilePath = path.join(__dirname, "IPL 2020-21", currTeamName, batsmanName + ".json");

                if (fs.existsSync(batsmanFilePath) == false) {
                    // Creating a new json file for the bastman and writing batsmanArr
                    let outputContent = JSON.stringify(batsmanArr);
                    fs.writeFileSync(batsmanFilePath, outputContent);
                } else {
                    let batsmanJSON = require(batsmanFilePath);
                    batsmanJSON.push(batsmanObj);
                    let updatedContent = JSON.stringify(batsmanJSON);
                    // Updating the content by pushing batsmanObj
                    fs.writeFileSync(batsmanFilePath, updatedContent);
                }

            }
        }
    }
}