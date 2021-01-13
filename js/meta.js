let metaData = [];

function addToMetaData(arr, call){
    let space = width/arr.length;

    metaData.push(arr.map(({entries, datum},i) => ({
        min: i*space,
        max: i*space + space,
        entries,
        datum,
    })));

    metaData[metaData.length-1].color = call.color;
}

function getMetaData(event){
    let [x, y] = [event.offsetX, event.offsetY];

    let matches = [];

    for(let data of metaData){
        let m1 = data.filter(e => e.min <= x && e.max >= x);
        if(m1.length > 0) matches[matches.push(m1[0])-1].color = data.color;
    }


    $('#info').css({
        "top":`${y}px`,
        "left":`${x+10}px`
    })
    .empty()
    .append(`${
        (matches.length == 0)? 'nothing to see here'
        : matches.map(match => `<div style = "color: ${match.color}">${match.entries}</div>`).join('')
    }`);
}

$('#corona-stats').mousemove(
    getMetaData
)
.hover(
    () => $('#info').css("visibility", "visible"),
    () => $('#info').css("visibility", "hidden")
);

