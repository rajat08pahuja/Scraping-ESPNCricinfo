// https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results

let request = require("request");
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";

request(url , cb);

function cb(err , response , html){
    if(err){
        console.log(err);
    } else{
        let chSelector = cheerio.load(html);

        let allMatchesScoreCard = chSelector(".card.content-block.league-scores-container .col-md-8.col-16 .match-cta-container a[data-hover = Scorecard]");

        for(let i = 0 ; i < allMatchesScoreCard.length ; i++){
            console.log(i);
            let eachMatchLink = "https://www.espncricinfo.com" + chSelector(allMatchesScoreCard[i]).attr('href');
            console.log(eachMatchLink);
        }
    }
}