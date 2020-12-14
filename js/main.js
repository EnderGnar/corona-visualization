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