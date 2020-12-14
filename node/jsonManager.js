const fs = require("fs");
const path = require("path");

const map = {
    COVID19Death_geoRegion:"death",
    COVID19Death_geoRegion_sex_w:"deathSEX",
    COVID19Death_geoRegion_AKL10_w:"deathAKL",

    COVID19Cases_geoRegion:"cases",
    COVID19Cases_geoRegion_sex_w:"casesSEX",
    COVID19Cases_geoRegion_AKL10_w:"casesAKL",

    COVID19Hosp_geoRegion:"hosp",
    COVID19Hosp_geoRegion_sex_w:"hospSEX",
    COVID19Hosp_geoRegion_AKL10_w:"hospAKL",

    COVID19Test_geoRegion_all:"test",
    COVID19Test_geoRegion_AKL10_w:"testAKL",
    COVID19Test_geoRegion_sex_w:"testSEX",
	
	COVID19Test_geoRegion_PCR_Antigen:"pcr-antigen",
}

exports.load = function(dirname, id){
    let name = map[id];
    if(name == undefined) return null;

    let pt = path.join(dirname, 'data', name+'.json');

    return fs.readFileSync(pt);
}

