// https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard

let request = require("request");
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');

// let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-kings-xi-punjab-36th-match-1216517/full-scorecard";
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard";

request(url, cb);

function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        let chSelector = cheerio.load(html);
        let matchDescription = chSelector(".match-info.match-info-MATCH .description").text();
        let descriptionArr = matchDescription.split(',');
        let venue = descriptionArr[1].trim();
        let date = descriptionArr[2].trim();

        // let teamNames = chSelector(".event .teams .team .name-detail p");
        let teamNames = chSelector(".event .teams>div");
        let winningTeam = "";
        let losingTeam = "";
        let matchStatus = "";

        for (let i = 0; i < 2; i++) {
            let teamName = chSelector(chSelector(teamNames[i]).find(".name")).text();

            let teamFolderPath = path.join(__dirname, "IPL 2020-21", teamName);

            if (fs.existsSync(teamFolderPath) == false) {
                fs.mkdirSync(teamFolderPath);
            }

            if (chSelector(teamNames[i]).hasClass("team-gray")) {
                losingTeam = teamName;
            } else {
                winningTeam = teamName;
            }

            if (losingTeam == "") {
                matchStatus = "Tied";
            }

        }

        console.log(matchStatus);
        console.log(venue);
        console.log(date);

    }
}