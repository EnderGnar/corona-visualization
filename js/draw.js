const ctx = document.getElementById("corona-stats").getContext("2d");

const width = 800;
const height = 400;


async function draw(id){
    ctx.clearRect(0,0,width,height);

    let condition = ({geoRegion}) => geoRegion == "CHFL";
    drawer.scale((await data.get("casesAKL")).filter(condition));

    for(let call of calls){
        if(call instanceof DrawCall){
            if(call.theme == undefined) continue;

            let array = await call.getBars();

            ctx.fillStyle = call.color;
            drawer.draw(array);
        }

        else if(call instanceof ScaleCall){
            drawer.scale(await call.scale());
        }
    }
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


const drawer = {

    scaling:1,

    draw: async function(bars){
        const space = width / bars.length;
    
        for(let i = 0; i < bars.length; i++){
            const bar = bars[i];
        
            ctx.beginPath();
            ctx.rect(i*space, height, space, -this.scaling*bar.entries);
            ctx.fill();
        }
    },

    scale: function(max){
        this.scaling = (height*0.9) / max;
    },
}