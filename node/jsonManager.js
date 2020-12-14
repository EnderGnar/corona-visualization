const fs = require("fs");
const path = require("path");

const map = {
    "death":"COVID19Death_geoRegion",
    "deathSEX":"COVID19Death_geoRegion_sex_w",
    "deathAKL":"COVID19Death_geoRegion_AKL10_w",

    "cases":"COVID19Cases_geoRegion",
    "casesSEX":"COVID19Cases_geoRegion_sex_w",
    "casesAKL":"COVID19Cases_geoRegion_AKL10_w",

    "hosp":"COVID19Hosp_geoRegion",
    "hospSEX":"COVID19Hosp_geoRegion_sex_w",
    "hospAKL":"COVID19Hosp_geoRegion_AKL10_w",

    "test":"COVID19Test_geoRegion_all",
    "testAKL":"COVID19Test_geoRegion_AKL10_w",
    "testSEX":"COVID19Test_geoRegion_sex_w",
	
	"pcr-antigen":"COVID19Test_geoRegion_PCR_Antigen",
}

exports.load = function(dirname, id){
    let name = map[id];
    if(name == undefined) return null;

    let pt = path.join(dirname, 'data', name+'.json');

    return fs.readFileSync(pt);
}

