window.onload = function(){
    let search = window.location.search;
    if(search == "") return;

    callsFromJSON(decodeURI(search.substr(1)));
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


$('#addProcess').click(
    function(e){
        generateCall("process");
    }
)

$('#addADD').click(
    function(e){
        generateCall("add");
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
        let json = callsToJSON();

        window.history.pushState({}, 'Corona vis', window.location.origin + "/?" + encodeURI(json));

        $('#json').val(json);
        $('#jsoninput').css('visibility','visible');
    }
)

$('#jsonbutton').click(
    function(e){
        let input = $('#json').val();

        callsFromJSON(input);

        $('#jsoninput').css('visibility','hidden');
        $('#jsonbutton').css('visibility','hidden');
    }
)

function callsToJSON(){
    let arr = calls.map(call => call.toString());

    return `[${arr.join(',')}]`;
}

function callsFromJSON(string){
    let arr = JSON.parse(string);

    for(let obj of arr){
        calls.push(callFrom(obj));
    }

    holder = document.getElementById("callholder");
    
    holder.innerHTML = "";

    for(let call of calls) {
        call.loadDependency();

        holder.appendChild(call.dom);
        call.renderDom();
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
        
        case "process":
            call = new ProcessCall(obj.id);

            call.theme = obj.theme;
            call.currAttr = obj.currAttr;
            call.filter = obj.filter;
            call.modifier = obj.modifier;

            return call;

        case "add":
            call = new AddCall(obj.id);

            call.dependencies = obj.dependencies;
            return call;
    }
}