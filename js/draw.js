const ctx = document.getElementById("corona-stats").getContext("2d");

const width = 800;
const height = 400;


async function draw(id){
    ctx.clearRect(0,0,width,height);

    for(let call of calls){
        if(call instanceof DrawCall){
            if(call.theme == undefined) continue;

            let array = await call.getBars();

            ctx.fillStyle = call.color;
            ctx.strokeStyle = call.color;

            drawer.draw(array, call.style);
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

    draw: async function(bars, style){
        const space = (width* 0.9) / bars.length;
    
        if(style == "Balken"){
            for(let i = 0; i < bars.length; i++){
                const bar = bars[i];
                
                ctx.beginPath();
                ctx.rect(0.1*width + i*space, height, space, -this.scaling*bar.entries);
                ctx.fill();
            }
        }
        else if(style == "Punkte"){
            for(let i = 0; i < bars.length; i++){
                const bar = bars[i];
                
                ctx.beginPath();
                ctx.arc(0.1*width + (i+0.5)*space, height - this.scaling*bar.entries, Math.max(space*0.2,4), 0, Math.PI*2);
                ctx.fill();
            }
        }
        else if(style == "Linie"){
            ctx.beginPath();



            for(let i = 1; i < bars.length; i++){
                const bar = bars[i];
                
                ctx.lineTo(0.1*width + (i+0.5)*space, height - this.scaling*bar.entries);
            }

            ctx.stroke();
        }

    },

    scale: function(max){
        this.scaling = (height*0.9) / max;

        let h = height/this.scaling;

        let size = Math.round(Math.log10(h));

        let powerDist = Math.pow(10, size-1) * this.scaling;

        ctx.strokeStyle = "#00000060";
        ctx.fillStyle = "#000000";

        for(let i = 0; powerDist*i <= height; i++){
            let y = height - powerDist * i;

            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(width,y);
            ctx.stroke();

            ctx.fillText(Math.pow(10, size-1)*i, 5, y-2);
        }
    },
}