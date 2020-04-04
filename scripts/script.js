/* todo: save city list to local Storage
add credit to openweatherapp on footer
make stuck footer
better graphics
tweak media styling

 */
$(document).ready(function(){

    // Identify the current hour
    var today=new Date();
    // format to display on the screen
    var currentDay=moment(today).format('DD-MM-YYYY');
    
    var cityList = getValuesFromLocalStorage('mycities');  //returns array of cities or empty array
    if (cityList!==[]){ 
        glCityList=cityList;
    } else {
        glCityList=[];
    };
    displayCityList(glCityList);
    var glCityName;

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
        };
        
    }; 

    function makeForecastURL(location){
        const prefix='https://api.openweathermap.org/data/2.5/forecast?q=';
        const apikey='9e5bcb40580afa0ce7d857fbb8439521';
        var theLocation = location + '&units=metric';
        const suffix='&APPID='+apikey;

        if (location !=''){
            var theURL=prefix+theLocation+suffix;
            return theURL;
        } else {
            return '';
        }
        
    }; 

    function makeUVurl(lat,long){
        const prefix='https://api.openweathermap.org/data/2.5/uvi?';
        const apikey='9e5bcb40580afa0ce7d857fbb8439521';
        var theLocation = 'lat=' + lat + '&lon=' + long ;
        const suffix= '&appid='+ apikey;

        if (location !=''){
            var theURL=prefix+theLocation+suffix;
            return theURL;
        } else {
            return '';
        }
        
    }

    function getCityData(city='',firstTime=true){
        
        var queryCurrentURL=makeURL(city);
        var queryForecastURL = makeForecastURL(city);
        var gotData=false;
        var gotForecastData = false;
        
        var cityname=city;
        var cityList=glCityList;

        let citydetails={
            'cityname': '', 
            lat: '', 
            long: ''
            };
        
        //Get Current Weather Data
        
        $.ajax({
            url: queryCurrentURL,
            method: "GET",
            success: function(response){
                gotData=true;
                cityname=updateScreen(response); 
                if (firstTime===true) {
                    addToCityList(cityname,cityList);
                };
                citydetails={'cityname':cityname,'lat':response.coord.lat, 'long':response.coord.lon };
                getUVDataFromAPI(citydetails,appendUVData);               
            },
            error: function(response){
                showAlert('Oops:',response.responseJSON.message,'info', response.responseJSON.cod);
            }
        }).then(function(response){
               
        });
        
        //Get Forecast Weather Data
        $.ajax({
            url: queryForecastURL,
            method: "GET",
            success: function(response){
                gotForecastData=true;
                updateForecastCards(response.list);
            },
            error: function(response){
                showAlert('Oops:',response.responseJSON.message,'warning', response.responseJSON.cod);
            }
        }).then(function(response){});
        return citydetails;
    };

    function renderDataToScreen(city,firstTime=true){
        let citydetails=getCityData(city,firstTime);
        return citydetails.cityname;
    } 

    function appendUVData(uvlevel){
        //Add uv details to the screen
        let uvtext=getUVtext(uvlevel);
        $('#currentUV').prop('innerHTML', uvtext);
   
    }

    function getUVtext(uvlevel=0){
        let uvs=[   {uvtext:'Low', uvlow:0, uvhigh:3,uvcolor:'Green'},
                    {uvtext:'Medium', uvlow:3, uvhigh:6,uvcolor:'Yellow'},
                    {uvtext:'High', uvlow:6, uvhigh:8,uvcolor:'Orange'},
                    {uvtext:'Very High', uvlow:8, uvhigh:11,uvcolor:'Red'},
                    {uvtext:'Extreme', uvlow:11, uvhigh:20,uvcolor:'Violet'}
                ];

        var whichUV=uvs.filter(thisuv => {
            return (uvlevel >= thisuv.uvlow && uvlevel < thisuv.uvhigh)
        });
        return whichUV[0].uvtext;      

    }

    function getUVDataFromAPI(citydetails=glCityName,callback){
        
        //get lat and long for cityname
        const lat=citydetails.lat;
        const long=citydetails.long;
        const queryUVurl=makeUVurl(lat,long);
        $.ajax({
            url: queryUVurl,
            method: "GET",
            success: function(response){
                var uvlevel=response.value;
                callback(uvlevel);   
            },
            error: function(response){
                showAlert('Oops:',response.responseJSON.message,'warning', response.responseJSON.cod);
            }
        }).then(function(response){
            
        });  
    };


    function updateForecastCards (dataObj){
        $('#futureWeatherCards').empty();

        for(var i=0; i<dataObj.length; i=i+8){
            var newdate = new Date(dataObj[i].dt*1000);
            var dateTextStr=moment(newdate).format('DD-MM-YY');
            var weatherDesc = dataObj[i].weather[0].main;
            var maxTemp=parseFloat(dataObj[i].main.temp).toFixed(0);
            var humidity=dataObj[i].main.humidity;
            var iconID=dataObj[i].weather[0].icon;
            var theIcon='http://openweathermap.org/img/wn/' + iconID + '@2x.png';
            
            
            //Create a new card
            var newCard=$('<div>');
            newCard.attr('class','card futureWeatherCard');
            var dayinc=(i/8);
            var newid='fw_'+ dayinc;
            newCard.attr('id',newid);
            $('#futureWeatherCards').append(newCard);

            //Fill out the card
            var newCardBody=$('<div>');
            newCardBody.attr('class', 'card-body');
            newCard.append(newCardBody);

            //New card header
            var newhdr=$('<h5>');
            newhdr.attr('class','card-title futuredataTitle');
            newhdr.text(dateTextStr);
            newCardBody.append(newhdr);

            //Weather Icon
            var newiconEl=$('<img>');
            newiconEl.attr('class','futureImg');
            newiconEl.attr( 'id','futureImg'+dayinc);
            newiconEl.attr('src',theIcon);
            newhdr.append(newiconEl);

            //New table for data
            var newTblEl=$('<table>');
            newTblEl.attr('class','table futureDataTbl container-fluid');
            newTblEl.attr('id','tbl_'+dayinc);
            newCardBody.append(newTblEl);

            //New table body <tbody class='container-fluid'>
            var newTblBodyEl=$('<tbody>');
            //newTblBodyEl.attr('class','container-fluid');
            newTblEl.append(newTblBodyEl);

            //New rows
            var newRowEl=$('<tr>');
            newTblEl.append(newRowEl);
        
            
            //Temp data
            var newtrel=$('<tr>');
            newtrel.attr('class','futureDataPt');
            newTblEl.append(newtrel);
            var newthel=$('<th>');
            newthel.attr('scope','row');
            newthel.text('Max temp:');
            newtrel.append(newthel);
            var newtdel=$('<td>');
            newtdel.attr('id','futMaxTemp_'+dayinc);
            newtdel.prop('innerHTML', maxTemp + '&degC');
            newtrel.append(newtdel);                   

            //Humidity data
            var newtrel=$('<tr>');
            newtrel.attr('class','futureDataPt');
            newTblEl.append(newtrel);
            var newthel=$('<th>');
            newthel.attr('scope','row');
            newthel.text('Humidity:');
            newtrel.append(newthel);
            var newtdel=$('<td>');
            newtdel.attr('id','futHumidity_'+dayinc);
            newtdel.prop('innerHTML', humidity + '%');
            newtrel.append(newtdel);   

            //Description data
            var newtrel=$('<tr>');
            newtrel.attr('class','futureDataPt');
            newTblEl.append(newtrel);
            var newthel=$('<th>');
            newthel.attr('scope','row');
            newthel.text('Conditions:');
            newtrel.append(newthel);
            var newtdel=$('<td>');
            newtdel.attr('id','futDesc_'+dayinc);
            newtrel.append(newtdel); 
            var newdescel=$('<p>');
            newdescel.prop('innerHTML', weatherDesc);
            newtdel.append(newdescel);   
        }
    }


    function showAlert(headerText='Warning', bodytext='Oops - something strange happened',type='warning',code){
        $('#alertmodal').attr('class','alert alert-'+ type);
        $('#alert-heading').prop('innerHTML',headerText);
        $('#alert-text').prop('innerHTML',bodytext);
        $('#alertmodal').show('slow');
    }

    function hideAlert(){
        $('#alertmodal').hide('fast');
    }

    function fromAngleToDirection(angle){
        const directions=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
        let meanAngle=Math.floor((angle/22.5)+0.5);
        return directions[meanAngle];
    }


    function updateScreen (dataObj) {
        var theIcon='http://openweathermap.org/img/wn/' + dataObj.weather[0].icon + '@2x.png';
        console.log(dataObj);        
        $('.cityname').prop('innerHTML', dataObj.name);
        $('.todaydate').prop('innerHTML', '(' + currentDay + ')');
        //$('.todaydate').text(' (' + currentDay + ')');
        $('.weathericon').attr('src',theIcon);
        
        $('.description').text(dataObj.weather[0].description);
        let timezone = secs => {
            let hrs=secs/3600;
            let tztext='';
            if (hrs<0){
                tztext= 'GMT' + hrs;
            } else {
                tztext = 'GMT+' + hrs
            };
            return tztext; 
        };
        $('#currenttime').prop('innerHTML',timezone(dataObj.timezone));
        
        $('.wind').prop('innerHTML',fromAngleToDirection(dataObj.wind.deg) + ' @ ' + dataObj.wind.speed + 'm/s' ) ;
        $('.humidity').text(dataObj.main.humidity + '%');
        $('#currentMaxTemp').prop('innerHTML',parseFloat(dataObj.main.temp).toFixed(1) +  '&degC');
        $('#currentMinTemp').prop('innerHTML',' (Feels like: ' + parseFloat(dataObj.main.feels_like).toFixed(1) +  '&degC)');
        
        $('.responsedata').fadeIn('slow',function(){});

        return dataObj.name;
    };

    function addToCityList(theCity='',cityList=[]) {
        
        if (theCity !== '') {
            var newCityli=$('<li>');
            newCityli.text( theCity);
            newCityli.attr('class','citylist-item');
            newCityli.attr('id',theCity);
            $('#citylist').append(newCityli);
            cityList.push(theCity.toUpperCase());
            saveValuesToLocalStorage('mycities',cityList);
            $('#clearbtn').css('visibility','visible');
            return cityList;
        }
    };

    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
        }
        return str.join(' ');
    }

    function displayCityList(cityList=[]){
        
        var mycityList=cityList;
        if (mycityList.length > 0 ) {
            $('#citylist').empty();
            for (var index=0; index< mycityList.length; index++) {
                var cityname=mycityList[index];
                var theCity=titleCase(cityname);
                var newCityli=$('<li>');
                newCityli.attr('class','citylist-item');
                $('#citylist').append(newCityli);
                var newCitybtn = $('<btn>');
                newCitybtn.text( theCity);
                newCitybtn.attr('class','button citylist-button');
                newCitybtn.attr('id',theCity);
                newCityli.append(newCitybtn);
            };
            $('#clearbtn').css('visibility','visible');
        };
    };

    // Get any information from Local Storage.  Returns the city list object if found.
    function getValuesFromLocalStorage(lsname="mycities"){
        var localStorageValue=localStorage.getItem(lsname);
        if(localStorageValue!=undefined){
            var dataObj=JSON.parse(localStorageValue);
            return dataObj;
        } else return [];
    };

        
    function saveValuesToLocalStorage(lsName='mycities',dataObj){
        localStorage.setItem(lsName,JSON.stringify(dataObj));
        return true;
    };

    function clearLocalStorage(lsName='mycities'){
        localStorage.removeItem(lsName);
    }

    $('form').submit(function(event){

        // Search for data about the City and if it is found, then add city to the list
        event.preventDefault();
        
        var getCity=$('.inputcity').val();
        var isFirstTime=true;
        var cityList=glCityList;
        if($.inArray(getCity.toUpperCase,cityList)>0){
            isFirstTime=false;
        }
        var name=renderDataToScreen(getCity,isFirstTime);
        if (name!=='') {
            cityList=addToCityList(name,cityList);
            glCityList=cityList;
        };

        $('.inputcity').val('');
        
    });

    $(document).on("click", '#citylist' , function() {
        if (event.target.id==='citylist') return;
        renderDataToScreen(event.target.id,false);
    });

    $(document).on("click",'#alertCloseBtn',function(){
        hideAlert();
    });

    $('#clearbtn').on('click',function(event){
        glCityList=[];
        $('.citylist').empty();
        clearLocalStorage('mycities');
        $('#clearbtn').css('visibility','hidden');
        location.reload(true);
    })

});
