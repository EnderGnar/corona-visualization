window.onload = function(){
    let search = window.location.search;
    if(search == "") return;

    settingsFromJSON(decodeURI(search.substr(1)));
};


$('#drawByCalls').click(
    function(e){
        draw();
    }
)

$('#addDraw').click(
    function(e){
        generateCall("draw");
    }
)
$('#addScale').click(
    function(e){
        generateCall("scale");
    }
)


$('#addImport').click(
    function(e){
        generateProcess("import");
    }
)

$('#addADD').click(
    function(e){
        generateProcess("add");
    }
)

$('#import').click(
    function(e){
        $('#jsoninput').css('visibility','visible');
        $('#jsonbutton').css('visibility','visible');
    }
)

$('#export').click(
    function(e){
        let json = settingsToJSON();

        window.history.pushState({}, 'Corona vis', window.location.origin + "/?" + encodeURI(json));

        $('#json').val(json);
        $('#jsoninput').css('visibility','visible');
    }
)

$('#jsonbutton').click(
    function(e){
        let input = $('#json').val();

        settingsFromJSON(input);

        $('#jsoninput').css('visibility','hidden');
        $('#jsonbutton').css('visibility','hidden');
    }
)

function settingsToJSON(){
    let callArr = calls.map(call => call.toString());
    let proArr = processes.map(process => process.toString());

    return `{"calls":[${callArr.join(',')}],
    "processes":[${proArr.join(',')}]}`;
}

function settingsFromJSON(string){
    let settings = JSON.parse(string);

    for(let obj of settings.calls){
        calls.push(callFrom(obj));
    }
    for(let obj of settings.processes){
        processes.push(processFrom(obj));
    }

    let callholder = document.getElementById("callholder");
    
    callholder.innerHTML = "";

    for(let call of calls) {
        call.loadDependency();

        callholder.appendChild(call.dom);
        call.renderDom();
    }

    let proholder = document.getElementById("processholder");
    proholder.innerHTML = "";

    for(let process of processes){
        process.loadDependency();

        proholder.appendChild(process.dom);
        process.renderDom();
    }
}

function callFrom(obj){
    let call;

    switch(obj.type){
        case "draw":
            call = new DrawCall(obj.id);

            call.color = obj.color;
            call.style = obj.style;

            call.dependency = obj.dependency;

            return call;

        case "scale":
            call = new ScaleCall(obj.id);

            call.dependency = obj.dependency;

            return call;
    }
}

function processFrom(obj){
    let pro;
    switch(obj.type){
        case "import":
            pro = new Import(obj.id);

            pro.theme = obj.theme;
            pro.currAttr = obj.currAttr;
            pro.filter = obj.filter;
            pro.modifier = obj.modifier;

            return pro;

        case "add":
            pro = new AddProcess(obj.id);

            pro.dependencies = obj.dependencies;
            return pro;
    }
}