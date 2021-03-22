let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');
const { match } = require('assert');

// input url --> https://www.espncricinfo.com/series/ipl-2020-21-1210595

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let resultsUrl = url + '/match-results';
request(resultsUrl, cb);

function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        let chSelector = cheerio.load(html);

        let eachMatchScorecardElement = chSelector('.match-score-block .match-cta-container a[data-hover = Scorecard]');

        let iplMainDir = path.join(__dirname, "IPL 2020-21");

        if (fs.existsSync(iplMainDir) == false) {
            fs.mkdirSync(iplMainDir);
        }

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
        let matchInfo = { venue: "", date: "" };
        let chSelector = cheerio.load(html);
        let firstTeam = { name: "", status: "" };
        let secondTeam = { name: "", status: "" };

        let matchInfoArr = chSelector('.event .match-info.match-info-MATCH .description').text().split(',');
        matchInfo.venue = matchInfoArr[1].trim();
        matchInfo.date = matchInfoArr[2].trim();

        let losingTeam = chSelector('.event .teams .team-gray a.name-link .name').text();

        let bothTeamNamesElement = chSelector('.event .teams .team a.name-link .name');

        if (losingTeam.length == 0) {
            firstTeam.name = chSelector(bothTeamNamesElement[0]).text();
            secondTeam.name = chSelector(bothTeamNamesElement[1]).text();
            firstTeam.status = secondTeam.status = "Tie";
        } else {
            if (chSelector(bothTeamNamesElement[0]).text() == losingTeam) {
                firstTeam.name = losingTeam;
                firstTeam.status = "Lost";
                secondTeam.name = chSelector(bothTeamNamesElement[1]).text();
                secondTeam.status = "Won";
            } else {
                firstTeam.name = chSelector(bothTeamNamesElement[0]).text();
                firstTeam.status = "Won";
                secondTeam.name = losingTeam;
                secondTeam.status = "Lost";
            }
        }

        // console.log(matchInfo);
        // console.log(firstTeam);
        // console.log(secondTeam);


        firstTeamDir = path.join(__dirname, "IPL 2020-21", firstTeam.name);
        secondTeamDir = path.join(__dirname, "IPL 2020-21", secondTeam.name);

        if (fs.existsSync(firstTeamDir) == false) {
            fs.mkdirSync(firstTeamDir);
        }

        if (fs.existsSync(secondTeamDir) == false) {
            fs.mkdirSync(secondTeamDir);
        }

        let tableNameElement = chSelector('.Collapsible .row.no-gutters.align-items-center .col h5.header-title.label');
        let tableElement = chSelector('.Collapsible .table.batsman');
        for (let i = 0; i < tableNameElement.length; i++) {
            // let teamName = chSelector(tableNameElement[i]).text().split('INNINGS')[0].trim();
            let currTeamName = (i == 0) ? firstTeam.name : secondTeam.name;

            let table = chSelector(tableElement[i]).find('tbody tr');

            for (let j = 0; j < table.length - 1; j += 2) {
                let tabledata = chSelector(table[j]).find('td');

                let batsmanName = chSelector(tabledata[0]).find('a').text().trim();
                let batsmanRuns = chSelector(tabledata[2]).text().trim();
                let batsmanBalls = chSelector(tabledata[3]).text().trim();
                let batsman4s = chSelector(tabledata[5]).text().trim();
                let batsman6s = chSelector(tabledata[6]).text().trim();
                let batsmansr = chSelector(tabledata[7]).text().trim();

                let batsmanObj = {
                    date : matchInfo.date,
                    opponent : (i == 0) ? secondTeam.name : firstTeam.name, 
                    venue : matchInfo.venue,
                    result : (i == 0) ? firstTeam.status : secondTeam.status,
                    runs: batsmanRuns,
                    balls: batsmanBalls,
                    fours: batsman4s,
                    sixes: batsman6s,
                    strikerate: batsmansr
                };

                let batsmanArr = [{
                    date : matchInfo.date,
                    opponent : (i == 0) ? secondTeam.name : firstTeam.name, 
                    venue : matchInfo.venue,
                    result : (i == 0) ? firstTeam.status : secondTeam.status,
                    runs: batsmanRuns,
                    balls: batsmanBalls,
                    fours: batsman4s,
                    sixes: batsman6s,
                    strikerate: batsmansr
                }];


                batsmanFilePath = path.join(__dirname, "IPL 2020-21", currTeamName, batsmanName + ".json");

                if (fs.existsSync(batsmanFilePath) == false) {
                    let outputContent = JSON.stringify(batsmanArr);
                    fs.writeFileSync(batsmanFilePath, outputContent);
                } else {
                    let batsmanJSON = require(batsmanFilePath);
                    // let prevArr = JSON.parse(batsmanJSON);
                    batsmanJSON.push(batsmanObj);
                    let updatedContent = JSON.stringify(batsmanJSON);
                    fs.writeFileSync(batsmanFilePath, updatedContent);
                }

            }
        }



        // console.log("```````````````````````````````````````````````````````````````");
    }
}
