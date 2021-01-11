let processes = [];

async function generateProcess(type){
    function generateId(){
        let id;
        do with(Math) id = "P"+floor(random()*9000000+1000000);
        while(calls.filter(c => c.id == id).length > 0);

        return id;
    }

    let process;
    if(type == "import") process = new Import(generateId());
    else if(type == "add") process = new AddProcess(generateId());

    processes.push(process);

    holder = document.getElementById("processholder");
    
    holder.appendChild(process.dom);

    for(let call of calls) call.renderDom();
    for(let process of processes) if(process.dependencies) process.renderDom();
}


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

class Process{
    id;
    dom;
    type;


    constructor(id){
        this.id=id;
        this.generateDOM();
    }

    generateDOM(){
        let div = document.createElement("div");

        div.id = this.id;
        div.className = "process";

        this.dom = div;
    }

    rerender(){
        this.renderDom();
    }

    renderDom(){
        let header = $('<div></div>');

        //Header
        header.append(
            $(`<b>${this.type}-process ${this.id}</b>`)
        );

        //delete
        let delbutton = $(`<button>delete this ${this.type}-process</button>`)
        .click((e) => {
			let pos = processes.indexOf(this);
            processes.splice(pos,1);

            //remove dependency needed!
            this.removeDependencies();

            $("#"+this.id).remove();
        });


		header.append(
            $('<div></div>')
            .append(delbutton)
        );


        this.dom.replaceChildren(header[0]);
    }

    removeDependencies(){
        let id = this.id;

        //from calls:
        for(let call of calls){
            if(call.dependency == this){
                call.dependency = undefined;
                call.rerender();
            } 
        }

        //from processes:
        for(let process of processes){
            if(process.dependencies){
                process.dependencies.filter(e => e == this);

                process.rerender();
            }
        }
    }
}

class Import extends Process{
    currAttr;
    currModifier;

    filter=[];

    modifier = [];

    constructor(id){
        super(id);
        this.type = "import";

        this.renderDom();
    }

    async renderDom(){
        super.renderDom();
        let div = document.createElement('div');


        
        //Theme
        div.appendChild(
            $('<div><span>Theme: </span></div>')
            .append(
                //theme selector
                helper.selector(this, themes, "theme")
            )[0]
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
            .append(
                //attribute selector
                helper.selector(this, attr, "currAttr")
            )
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

        this.dom.append(div);
    }

    renderFilter = async function(filter){
        //filter
        let div = $('<div></div>');

        //Filter name.
        div.append($(`<span>${filter.attribute}: </span>`));

        let values = (await data.get(this.theme)).map(e => e[filter.attribute]).filter((e,i,a) => a.indexOf(e) == i).sort();

        //selection over all values.
        let selection = helper.selector(filter, values, "value");

        selection.filter = filter;

        return div.append(selection);
    }



    renderModifier = function(){
        let div = $('<div><span>Modifier: </span></div>');
        let process = this;

        let select = helper.selector(this, modifiers.map(m => m.name), "currModifier");


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
            let modSelect = helper.selector(mod, parent.options, "option");

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


class AddProcess extends Process{
    dependencies = [];

    constructor(id){
        super(id);

        this.type = "add";

        this.renderDom();
    }

    renderDom(){
        super.renderDom();

        let div = document.createElement('div');

        for(let d of this.dependencies){
            div.appendChild($(`<div class = "adding" aid = "${d.id}">adds: ${d.id}</div>`)[0]);
        }

        div.appendChild(
            this.dependencySelector()
        );

        $(div).find(".adding").hover(
            function(e){
                $(`#${this.getAttribute("aid")}`).css(
                    "background-color","#ffcccc"
                )
            },
            function(e){
                $(`#${this.getAttribute("aid")}`).css(
                    "background-color",""
                )
            }
        );

        this.dom.appendChild(div);
    }

    dependencySelector = function(){
        let process = this;

        return $(`<select name="theme">
                '<option value="" selected hidden>add new</option>
                ${
                    processes.filter(e=>e.id != process.id)
                    .map(e => `<option value="${e.id}">${e.id}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                if(this.value == "") return;
                process.dependencies.push(processes.find(x => x.id == this.value));
                process.rerender();
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
            if(typeof dep == 'string'){
                this.dependencies[i] = processes.find(e => e.id == dep);
            }
        }
    }
}