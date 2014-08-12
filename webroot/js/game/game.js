    $(document).ready(function(){
    $.ajax({
        url: "/webroot/maps/first.json",
        success: function (data) {
            solve(data);
            display();
        }
    });
});