// https://www.espncricinfo.com/series/ipl-2020-21-1210595
let request = require("request");
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url , cb);

function cb(err , response , html){
    if(err){
        console.log(err);
    } else{
        let folderName = "IPL 2020-21";
        let folderPath = path.join(__dirname , folderName);

        if(fs.existsSync(folderPath) == false){
            fs.mkdirSync(folderPath);
        }

        let chSelector = cheerio.load(html);

        let allMatchesLink = "https://www.espncricinfo.com" + chSelector("li.widget-items.cta-link a").attr('href');
        console.log(allMatchesLink);
    }
}