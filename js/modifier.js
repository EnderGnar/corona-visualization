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
    }
]

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

    for(let bar of arr){
        let n = clone(bar);
        n.entries = n.sumTotal;

        out.push(n);
    }

    return out;
}