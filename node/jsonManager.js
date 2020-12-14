const fs = require("fs");
const path = require("path");

const map = {
    death:"death",
    deathSEX:"deathSEX",
    deathAKL:"deathAKL",

    cases:"cases",
    casesSEX:"casesSEX",
    casesAKL:"casesAKL",

    hosp:"hosp",
    hospSEX:"hospSEX",
    hospAKL:"hospAKL",

    test:"test",
    testAKL:"testAKL",
    testSEX:"testSEX",
}

exports.load = function(dirname, id){
    let name = map[id];
    if(name == undefined) return null;

    let pt = path.join(dirname, 'data', name+'.json');

    return fs.readFileSync(pt);
}

