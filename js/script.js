//Global
var apiKey = "b334b35106f8ae0fa14affa96fae3ab4"
var baseUrl = 'https://api.forecast.io/forecast/' + apiKey
var weatherDisplay = document.querySelector('#weatherDisplay')

var todayDisplay = document.querySelector('#home')
var weeklyDisplay = document.querySelector('#weekly')
var hourlyDisplay = document.querySelector('#hourly')

var search = document.querySelector('input')
console.log([search])
search.value = "This doesn't work yet"
location.hash = ''

var latitude = ''
var longitude = ''




//Functions 

//View Constructor 
//1st View
var renderTodayView = function(obj) {
   
    var htmlString = ''
    var currentTemp = obj.currently
    htmlString += '<div id="today"><p>Right Now</p><p>' + currentTemp.temperature + '&ordmF</p>'
    htmlString += '<p>' + currentTemp.summary + '</p>'
    weatherDisplay.innerHTML = htmlString
}


//2nd View
var renderWeeklyView = function (obj){
	var htmlString = ''
	var arrayOfObj = obj.daily.data

		for (var i =0; i<arrayOfObj.length;i++){
				var day = arrayOfObj[i]
				var time = day.time 
				time = time * 1000

				var d = new Date(time);
				var weekday = new Array(7);
weekday[0]=  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
var n = weekday[d.getDay()];
				var formattedDate = n 
				htmlString += '<div class="weeklyBars"><h1 class="maxTemp">'+ formattedDate +'</h1><h1 class="maxTemp">' + day.apparentTemperatureMax
				htmlString += '\xB0F</h1><h2 class="minTemp">' + day.apparentTemperatureMin + '\xB0F</h2><h3 class="description">' + day.icon 
				htmlString += '</h3></div>'
		}
	

	weatherDisplay.innerHTML = htmlString

}


//3rd View
 var renderHourlyView = function (obj) {
 	var htmlString = ''
 	var arrayOfObj = obj.hourly.data
 		for (var i =0; i<24;i++){
 		var hour = arrayOfObj[i]
 		var time = hour.time
 		time = time * 1000
 		var d = new Date(time)
 		var hours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours();
 		var minutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
 		var formattedTime = hours + ":" + minutes;

 		htmlString += '<div class="hourlyBars"><h1>'+formattedTime+'</h1><h2>' + hour.temperature + '</h2><h3>' 
 		htmlString += hour.summary + '</h3></div>'
 		}
 	weatherDisplay.innerHTML = htmlString
	
 }


var ViewConstructor = function (domEl, templateHTML_fn){
	this._el = domEl
	this._buildHTMLString = templateHTML_fn
	this.getLocation = function() {
    var success = function(obj) {
        this.latitude = obj.coords.latitude
    
        this.longitude = obj.coords.longitude


        var fullUrl = baseUrl + '/' + latitude + ',' + longitude + '?callback=?' 
        var promise= $.getJSON(fullUrl)
        promise.then(templateHTML_fn)  
    }
    navigator.geolocation.getCurrentPosition(success)
}

	// this.renderHTML = function (inputData){
	// 	document.querySelector(this._el).innerHTML = this._buildHTMLString(inputData)	
	// }

}

//Test 
var showData = function(JSON) {
        console.log(JSON)
    }

var changeView = function(event) {
        var buttonEl = event.target
        location.hash = buttonEl.id
 
    }
    //Call Stuff
var today = new ViewConstructor (weatherDisplay, renderTodayView)
var weekly = new ViewConstructor(weatherDisplay, renderWeeklyView)
var hourly = new ViewConstructor(weatherDisplay, renderHourlyView)


var controller = function () {
	if(window.location.hash === '#weekly'){
		
		 weekly.getLocation()
	}if(window.location.hash === '#hourly'){

		hourly.getLocation()
	}else {
		today.getLocation()
	}
}

window.addEventListener("hashchange", controller)
controller()
todayDisplay.addEventListener("click", changeView)
weeklyDisplay.addEventListener("click", changeView)
hourlyDisplay.addEventListener("click", changeView)
