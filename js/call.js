let calls = [];

async function generateCall(type){
    function generateId(){
        let id;
        do with(Math) id = floor(random()*9000000+1000000);
        while(calls.filter(c => c.id == id).length > 0);

        return id;
    }

    let call;
    if(type == "draw") call = new DrawCall(generateId());
    else if(type == "scale") call = new ScaleCall(generateId());
    else if(type == "process") call = new ProcessCall(generateId());
    else if(type == "add") call = new AddCall(generateId());

    calls.push(call);


    holder = document.getElementById("callholder");
    
    holder.appendChild(call.dom);

    for(let call of calls) if(call instanceof ScaleCall) call.renderDom();
}



class Call{
    id;
    dom;
    type;


    constructor(id){
        this.id=id;
        this.generateDOM();
    }

    generateDOM = function(){
        let div = document.createElement("div");

        div.id = this.id;

        this.dom = div;
    }

    rerender = function(){
        this.renderDom();
    }

    renderDom = function(){
        this.dom.innerText=this.id;
    }
}


const colors = [
    "blue",
    "red",
    "green",
    "yellow",

    "pink",
    "lightblue",
]

const styles = [
    "Balken",
    "Punkte",
    "Linie",
]


class DrawCall extends Call{
    dependency;

    color= "blue";
    style = styles[0];

    constructor(id){
        super(id);
        this.type = "draw";

        this.renderDom();
    }

    renderDom =  async function (){
        let div = document.createElement('div');

        div.appendChild(
            $(`<b>draw call ${this.id}</b>`)[0]
        );
		
		//delete
		let delbutton = $('<button>delete this drawcall</button>')
        .click((e) => {
			let pos = calls.indexOf(this);
            calls.splice(pos,1);

			$("#"+this.id).remove();
        });
		
		div.appendChild(
		$('<div></div>')
		.append(delbutton)[0]);
		
		
        //dependency

        //Color Select
        div.appendChild(
            $('<div><span>Color: </span></div>')
            .append(this.colorSelector())[0]
        )

        //Style Select
        div.appendChild(
            $('<div><span>Style: </span></div>')
            .append(this.styleSelector())[0]
        );

        div.appendChild(
            this.dependencySelector()
        );

        this.dom.replaceChildren(div);
    }


    colorSelector = function(){
        //Selector for theme standard value = "none"
        //on change rerenders DOM with given information.

        let call = this;

        return $(`<select name="theme" value="death">
                ${(this.color == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    colors.map(e => `<option value="${e}" ${(this.color == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                call.color = this.value;
            })[0];
    }

    styleSelector = function(){
        //Selector for theme standard value = "none"
        //on change rerenders DOM with given information.

        let call = this;

        return $(`<select name="theme" value="death">
                ${(this.style == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    styles.map(e => `<option value="${e}" ${(this.style == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                call.style = this.value;
            })[0];
    }

    dependencySelector = function(){
        let call = this;

        return $(`<select name="theme">
                ${(this.dependency == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    calls.filter(e => (e instanceof ProcessCall))
                    .map(e => `<option value="${e.id}" ${(this.dependency && this.dependency.id == e)?"selected":""}>${e.id}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                call.dependency = calls.find(x => x.id == Number(this.value));
            })[0];
    }

    getBars = async function(){
        if(this.dependency == undefined) throw "NEEDS DEPENDENCY";

        return await this.dependency.getBars();
    }

    toString = function(){
        return JSON.stringify({
            id: this.id,
            type: this.type,
            color: this.color,
            style: this.style,
            dependency: (this.dependency)?this.dependency.id:undefined,
        });
    }

    loadDependency = function (){
        if(typeof this.dependency == 'number'){
            this.dependency = calls.find(e => e.id == this.dependency);
        }
    }
}





class ScaleCall extends Call{    
    dependency;

    constructor(id){
        super(id);
        this.type = "scale";

        this.renderDom();
    }

    renderDom =  async function (){
        let div = document.createElement('div');

        div.appendChild(
            $('<b>scale call</b>')[0]
        );
		
		//delete
		let delbutton = $('<button>delete this scalecall</button>')
        .click((e) => {
			let pos = calls.indexOf(this);
            calls.splice(pos,1);
			$("#"+this.id).remove();
        });


        div.appendChild(
            this.dependencySelector()
        );
		
		div.appendChild(
		$('<div></div>')
		.append(delbutton)[0]);

        this.dom.replaceChildren(div);
    }

    dependencySelector = function(){
        let call = this;

        return $(`<select name="theme">
                ${(this.dependency == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    calls.filter(e => (e instanceof ProcessCall))
                    .map(e => `<option value="${e.id}" ${(this.dependency && this.dependency.id == e)?"selected":""}>${e.id}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                call.dependency = calls.find(x => x.id == Number(this.value));
            })[0];
    }

    scale = async function(){
        if(this.dependency == undefined) throw "NEEDS DEPENDENCY";

        let arr = await this.dependency.getBars();
        let max = 0;

        for(let {entries} of arr) if(entries > max) max = entries;

        return max;
    }

    toString = function(){
        return JSON.stringify({
            id:this.id,
            type:this.type,
            dependency: (this.dependency)?this.dependency.id:undefined,
        });
    }

    loadDependency = function (){
        if(typeof this.dependency == 'number'){
            this.dependency = calls.find(e => e.id == this.dependency);
        }
    }
}