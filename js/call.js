let calls = [];

async function generateCall(type){
    function generateId(){
        let id;
        do with(Math) id = "C"+floor(random()*9000000+1000000);
        while(calls.filter(c => c.id == id).length > 0);

        return id;
    }

    let call;
    if(type == "draw") call = new DrawCall(generateId());
    else if(type == "scale") call = new ScaleCall(generateId());

    calls.push(call);


    holder = document.getElementById("callholder");
    
    holder.appendChild(call.dom);
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
        div.className = "call";

        this.dom = div;
    }

    rerender = function(){
        this.renderDom();
    }

    renderDom(){
        let header = $('<div></div>');
        header.append(
            $(`<b>${this.type}-call ${this.id}</b>`)
        );
		
		//delete
		let delbutton = $(`<button>delete this ${this.type}-call</button>`)
        .click((e) => {
			let pos = calls.indexOf(this);
            calls.splice(pos,1);

			$("#"+this.id).remove();
        });
		
		header.append(
            $('<div></div>')
            .append(delbutton)
        );

        this.dom.replaceChildren(header[0]);
    }



    loadDependency(){
        if(typeof this.dependency == 'string'){
            this.dependency = processes.find(e => e.id == this.dependency);
        }
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

    async renderDom(){
        super.renderDom();
        let div = document.createElement('div');

        //Color Select
        div.appendChild(
            $('<div><span>Color: </span></div>')
            .append(
                helper.selector(this, colors, "color")
            )[0]
        )

        //Style Select
        div.appendChild(
            $('<div><span>Style: </span></div>')
            .append(
                helper.selector(this, styles, "style")
            )[0]
        );

        //dependency
        div.appendChild(
            helper.dependencySelector(this,
                (value) => {
                    this.dependency = processes.find(p => p.id == value);
                }
            )
        );

        this.dom.appendChild(div);
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
}





class ScaleCall extends Call{    
    dependency;

    constructor(id){
        super(id);
        this.type = "scale";

        this.renderDom();
    }

    async renderDom(){
        super.renderDom();
        let div = document.createElement('div');

        div.appendChild(
            helper.dependencySelector(this,
                (value) => {
                    this.dependency = processes.find(p => p.id == value);
                }
            )
        );

        this.dom.appendChild(div);
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
}