const data = {
    load: async function(id){
        let loaded = await fetch(`/json/${id}`);
        let json = await loaded.json();
    
        if(json == null) console.error("FILE NOT FOUND 404");

        return json;
    },

    get: async function(id){
        if(!this[id]) data[id] = await this.load(id);
        
        return this[id];
    },

    getAttributes: async function(id){
        let attr = [];
        for(a in (await this.get(id))[0]) attr.push(a);
        return attr;
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



class ProcessCall extends Call{
    currAttr;
    currModifier;

    filter=[];

    modifier = [];

    constructor(id){
        super(id);
        this.type = "process";

        this.renderDom();
    }

    renderDom = async function(){
        let div = document.createElement('div');

        //Header
        div.appendChild(
            $(`<b>data processor ${this.id}</b>`)[0]
        );

        //delete
		let delbutton = $('<button>delete this process call</button>')
        .click((e) => {
			let pos = calls.indexOf(this);
            calls.splice(pos,1);

            calls.forEach(call => {
                if(call instanceof ScaleCall || call instanceof DrawCall){
                    if(call.dependency == this) {
                        call.dependency = null;
                        call.rerender();
                    }
                }
            })
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


    getBars = async function(){
        let array = await data.get(this.theme);

        //Filter
        for(let filter of this.filter){
            array = array.filter(e => e[filter.attribute] == filter.value);
        }

        //Modify

        for(let mod of this.modifier){
            if(mod.option == undefined) continue;

            array = runModifier(mod, array);
        }

        return array;
    }

    toString = function(){
        return JSON.stringify(this);
    }

    loadDependency = function(){};
}


class AddCall extends ProcessCall{
    dependencies = [];

    constructor(id){
        super(id);

        this.type = "add";

        this.renderDom();
    }

    renderDom = function(){
        let div = document.createElement('div');

        //Header
        div.appendChild(
            $(`<b>data adder ${this.id}</b>`)[0]
        );

        //delete
		let delbutton = $('<button>delete this add call</button>')
        .click((e) => {
			let pos = calls.indexOf(this);
            calls.splice(pos,1);

            calls.forEach(call => {
                if(call instanceof ScaleCall || call instanceof DrawCall){
                    if(call.dependency == this) {
                        call.dependency = null;
                        call.rerender();
                    }
                }
                else if(call instanceof DrawCall){

                }
            })
            $("#"+this.id).remove();
        });

        for(let d of this.dependencies){
            div.appendChild($(`<div>adds: ${d.id}</div>`)[0]);
        }

        div.appendChild(this.dependencySelector());

        this.dom.replaceChildren(div);
    }

    dependencySelector = function(){
        let call = this;

        return $(`<select name="theme">
                '<option value="" selected hidden>add new</option>
                ${
                    calls.filter(e => (e instanceof ProcessCall && e != this))
                    .map(e => `<option value="${e.id}">${e.id}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                if(this.value == "") return;
                call.dependencies.push(calls.find(x => x.id == Number(this.value)));
                call.rerender();
            })[0];
    }

    getBars = async function(){
        if(this.dependencies.length == 0) throw "WTF BRO";

        let out = (await this.dependencies[0].getBars()).map(e => clone(e));

        for(let i = 1; i < this.dependencies.length; i++){
            let arr = await this.dependencies[i].getBars();

            for(let j = 0; j < arr.length; j++) out[j].entries += arr[j].entries;
        }

        return out;
    }

    toString = function(){
        return JSON.stringify({
            id:this.id,
            type:this.type,
            dependencies: this.dependencies.map(e => e.id),
        });
    }


    loadDependency = function (){
        for(let i = 0; i < this.dependencies.length; i++){
            let dep = this.dependencies[i];
            if(typeof dep == 'number'){
                this.dependencies[i] = calls.find(e => e.id == dep);
            }
        }
    }
}