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
}

const themes = [
    "cases",
    "casesAKL",
    "casesSEX",


    "death",
    "deathAKL",
    "deathSEX",


    "hosp",
    "hospAKL",
    "hospSEX",
	
	"pcr-antigen",
];

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
    theme;
    currAttr;
    currModifier;

    color= "blue";
    style = styles[0];

    filter=[];

    modifier = [];

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
		
		
        //Theme
        div.appendChild(
            $('<div><span>Theme: </span></div>')
            .append(this.themeSelector())[0]
        );

        //Color Select
        div.appendChild(
            $('<div><span>Color: </span></div>')
            .append(this.colorSelector())[0]
        )

        //Style Select
        //Color Select
        div.appendChild(
            $('<div><span>Style: </span></div>')
            .append(this.styleSelector())[0]
        )

        if(this.theme != undefined){

            //Get all attributes, given by the theme.
            let attr = await data.getAttributes(this.theme);

            let attributes = $('<div><div>Filters: </div></div>');

            //Button for adding attribute to filter
            let attraddbutton = $('<button>add</button>')
            .click(async (e) => {
                if(this.currAttr==undefined) return;
                await this.addFilter();
                this.rerender();
            });

            //Headline for Filter controll.
            attributes.children().first()
            .append(this.attributeSelector(attr))
            .append(attraddbutton);

            //Removes all filters nomore in use.
            this.filter = this.filter.filter(e => attr.indexOf(e.attribute) > -1);

            //add filters to list.
            for(let filter of this.filter){
                attributes.append(
                    await this.renderFilter(filter)
                );
            }

            div.appendChild(attributes[0]);
        }

        //Modifier
        div.appendChild(
            this.renderModifier()
        );


        this.dom.replaceChildren(div);
    }

    themeSelector = function(){
        //Selector for theme standard value = "none"
        //on change rerenders DOM with given information.

        let call = this;

        return $(`<select name="theme" value="death">
                ${(this.theme == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    themes.map(e => `<option value="${e}" ${(this.theme == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                call.theme = this.value; 
                call.rerender();
            })[0];
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

    attributeSelector = function(attr){
        //selector of all attributes given by a theme.
        //#######has to have filters for what to show.#######

        let call = this;

        return $(`<select name="newAttr" value="death">
                ${(!attr.find(e => e == this.currAttr))? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    attr.map(e => `<option value="${e}" ${(this.currAttr == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {call.currAttr = this.value; call.rerender()})[0];
    }

    renderFilter = async function(filter){
        //filter
        let div = $('<div></div>');

        //Filter name.
        div.append($(`<span>${filter.attribute}: </span>`));

        let values = (await data.get(this.theme)).map(e => e[filter.attribute]).filter((e,i,a) => a.indexOf(e) == i).sort();

        //Similar to all other selections.
        let selection = $(`<select name="option">
            ${(!values.find(e => e == this.filter.value))? '<option value="" selected disabled hidden>not selected</option>':''}
            ${
                values.map(e => `<option value="${e}" ${(filter.value == e)?"selected":""}>${e}</option>`).join(' ')
            }
        </select>`)
        .change(function(e) {this.filter.value = this.value;})[0];

        selection.filter = filter;

        return div.append(selection);
    }

    renderModifier = function(){
        let div = $('<div><span>Modifier: </span></div>');
        let call = this;

        let select = $(`<select name="theme" value="death">
            ${(this.currModifier == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
            ${
                modifiers.map(e => `<option value="${e.name}" ${(this.currModifier == e.name)?"selected":""}>${e.name}</option>`).join(' ')
            }
        </select>`)
        .change(function(e) {
            call.currModifier = this.value;
        });


        let addbutton = $('<button>add</button>')
        .click((e) => {
            if(this.currModifier==undefined) return;
            this.addModifier();
            this.rerender();
        });

        div.append(select);
        div.append(addbutton);

        let holder = $('<div></div>');
        for(let mod of this.modifier){
            let parent = modifiers.find(e => e.name == mod.name);
            let modDom = $(`<div><span>${mod.name}: </span></div>`)
            let modSelect = $(`<select name="modifier">
                ${(!parent.options.find(e => e == mod.option))? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    parent.options.map(e => `<option value="${e}" ${(mod.option == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {mod.option = this.value; call.rerender()})[0];

            modDom.append(modSelect);
            holder.append(modDom);
        }

        div.append(holder);

        return div[0];
    }

    addFilter = async function(){
        let attr = await data.getAttributes(this.theme);

        if(!attr.find(e=>e==this.currAttr)) return console.log("ATTR NOT FOUND");

        this.filter.push({
            attribute: this.currAttr,
        })
    }

    addModifier = function(){
        if(modifiers.find(e => e.name == this.currModifier) == undefined) return;

        let mod = {
            name: this.currModifier,
            option: undefined,
        }

        this.modifier.push(mod);
    }

    rerender = function(){
        this.renderDom();
    }

    getBars = async function(){
        let array = await data.get(this.theme);

        //Filter
        for(let filter of this.filter){
            array = array.filter(e => e[filter.attribute] == filter.value);
        }

        //Modify

        for(let mod of this.modifier){
            if(mod.option == undefined) continue;

            switch(mod.name){
                case "running-average":
                    array = runningAverage(array, mod.option);
                    break;
                case "multiplier":
                    array = multiplier(array, mod.option);
                    break;
                case "benford":
                    array = benford(array);
                    break;
                case "sum-up":
                    array = sumUp(array, mod.option);
                    break;
            }
        }

        return array;
    }
}



class ScaleCall extends Call{    
    dependency;

    constructor(id){
        super(id);
        this.type = "draw";

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
                    calls.filter(e => (e instanceof DrawCall))
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

        console.log(max);
        return max;
    }
}