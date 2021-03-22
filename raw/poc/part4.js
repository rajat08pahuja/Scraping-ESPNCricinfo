let request = require("request");
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');


let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard";

request(url , cb);

function cb(err , response , html){
    if(err){
        console.log(err);
    } else{
        let chSelector = cheerio.load(html);
        let collapsibles = chSelector(".Collapsible");

        for(let i = 0 ; i < collapsibles.length ; i++){
            let teamNameElements = chSelector(collapsibles[i]).find(".col .header-title.label").text();
            let teamName = teamNameElements.split("INNINGS")[0].trim();
            // console.log(teamName);

            let allStats = chSelector(collapsibles[i]).find(".table.batsman tbody");
            console.log(allStats.length);
            for(let i = 0 ; i < allStats.length ; i++){
                console.log(chSelector(allStats[i]).html());
            }
        }
    }
}