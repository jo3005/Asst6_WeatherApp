$(document).ready(function(){

    // Identify the current hour
    var currentDatetime=Date();
    // format to display on the screen
    var currentDay=moment(currentDatetime).format('MMM DD, YYYY');



//var queryURL='https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=9e5bcb40580afa0ce7d857fbb8439521'

function makeURL(location){
    const prefix='https://api.openweathermap.org/data/2.5/weather?q=';
    const apikey='9e5bcb40580afa0ce7d857fbb8439521';
    var theLocation = location + '&units=metric';
    const suffix='&APPID='+apikey;

    if (location !=''){
        var theURL=prefix+theLocation+suffix;
        return theURL;
    } else {
        return '';
    }
    
} 

function getCityData(city=''){
    
    var queryURL=makeURL(city);
    
    $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response){
        console.log(response.name);
        //$('.city').attr('innerHTML',response.name);

        var thetemp=parseFloat(response.main.temp_max);
        var theIcon='http://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png'

        $('.weathericon').attr('src',theIcon);
        $('.todaydate').text(' (' + currentDay + ')');
        $('.description').text(response.weather[0].description);
        $('.city').text(response.name);
        $('.wind').text('Wind speed = ' + response.wind.speed + ', Wind direction =  '+ response.wind.deg);
        $('.humidity').text(response.main.humidity + '%');
        $('.temp').text(thetemp.toFixed(1));
        console.log(response);
      });

}


$('#searchbtn').on('click',function(){
    getCityData($('#inputcity').val());
});

$('#inputcity').on('keypress',function(event){
    console.log(event.which);
    if (event.which === 13) {
        console.log('entered city data');
        getCityData($('#inputcity').val())
    };
})

});
