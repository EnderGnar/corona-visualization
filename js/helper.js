const helper = {
    selector: function(caller, array, attr){
        return $(`<select name="${attr}">
                ${(caller[attr] == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
                ${
                    array.map(e => `<option value="${e}" ${(caller[attr] == e)?"selected":""}>${e}</option>`).join(' ')
                }
            </select>`)
            .change(function(e) {
                caller[attr] = this.value; 
                caller.rerender();
            })[0];
    },

    dependencySelector: function(caller, action = (value) => value, depLocation = "dependency"){
        let sel = $(`<select name="dependency">
            ${(caller[depLocation] == undefined)? '<option value="" selected disabled hidden>not selected</option>':''}
            ${
                processes.filter(p => p.id != caller.id)
                    .map(e => `<option value="${e.id}" ${(caller[depLocation] && caller[depLocation].id == e.id)?"selected":""}>${e.id}</option>`).join(' ')
            }
        </select>`)
        .change(function(e) {
            action(this.value);

            $(`.process`).css(
                "background-color",""
            )
            $(`#${this.value}`).css(
                "background-color","#ffcccc"
            )
        });

        sel.hover(
            //in
            function(e){
                if(this.value == "") return;
                $(`.process`).css(
                    "background-color",""
                )
                $(`#${this.value}`).css(
                    "background-color","#ffcccc"
                )
            }, 
            //out
            function(e){
                $(`.process`).css(
                    "background-color",""
                )
            }
        );

        return sel[0];
    },
}