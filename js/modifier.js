const modifiers = [
    {
        name:"running-average",
        options:[1,3,5,7,11,15,31],
    },
    {
        name:"multiplier",
        options:["1", "7", "1/7"],
    },

    {
        name:"benford",
        options:["none"],
    },

    {
        name: "sum-up",
        options:["on", "off"],
    },

    {
        name: "time-scale",
        options:["daily", "weekly"],
    },
]

function runModifier(mod, array){
    switch(mod.name){
        case "running-average":
            return runningAverage(array, mod.option);
        case "multiplier":
            return multiplier(array, mod.option);
        case "benford":
            return benford(array);
        case "sum-up":
            return sumUp(array, mod.option);
        case "time-scale":
            return timeScale(array, mod.option);
    }
}

//ONLY JSON STYLE OBJECTS!!! WITHOUT ARRAYS OR INNER OBJECTS
function clone(obj){
    let out = {};
    for(let i in obj) out[i] = obj[i];
    return out;
}

function runningAverage(array, str){
    let out = [];

    let of = Math.floor(Number(str)/2);

    for(let i = 0; i < array.length; i++){
        let sum = 0;
        let con = 0;

        for(let j = -of; j <= of; j++) if(i+j >= 0 && i+j < array.length){
            sum += array[i+j].entries;
            con++;
        }

        let n = clone(array[i]);
        n.entries = (con > 0)? sum/con: array[i].entries;

        out.push(n);
    }

    return out;
}

function multiplier(array, str){
    let x = eval(str);

    let out = [];

    for(let bar of array){
        let n = clone(bar);

        n.entries *= x;

        out.push(n);
    }

    return out;
}

function benford(arr){
    let total = [0,0,0,0,0,0,0,0,0,0];

    arr.map(e => String(e.entries)[0]).forEach(e => total[e]++);

    let withoutzero = total.splice(1)
    let sum = withoutzero.reduce((a,x)=>a+x,0);

    return withoutzero.map(e => ({entries:e/sum*100}));
}

function sumUp(arr, on){
    if(on == "off") return arr;

    let out = [];

    let sum = 0;
    for(let bar of arr){
        sum += bar.entries;

        let n = clone(bar);
        n.entries = sum;

        out.push(n);
    }

    return out;
}

function timeScale(arr, time){
    let out = [];

    const dayTime = 24*3600*1000;
    const weekTime = 7*dayTime;
    const week9 = new Date("2020-02-24");

    const version = new Date(arr[0].version.substr(0, 10));

    //ONLY 2020 accepted.
    const weekN = (n) => (new Date(week9.getTime() + 7*24*3600*1000*(n-9)));

    let weekweek = time == "weekly" && arr[0].datum_unit == "isoweek";
    let dayday = time == "daily" && arr[0].datum_unit == "day";

    if(weekweek || dayday) return arr;

    if(time == "daily"){
        //DATA IS IN ISOWEEKS

        for(let week of arr){
            let begin = weekN(week.datum%100);

            let days = 7;

            if(!(version.getTime() - begin.getTime() >= weekTime)) 
                days = Math.floor((version.getTime()-begin.getTime())/dayTime);

            for(let i = 0; i < days; i++){
                let day = clone(week);
                day.entries = week.entries/days;
                day.datum = (new Date(begin.getTime() + i * dayTime).toISOString());
                day.datum_unit = "day";

                out.push(day);
            }
        }
    }

    return out;
}