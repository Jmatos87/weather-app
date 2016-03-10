//Global
var apiKey = "b334b35106f8ae0fa14affa96fae3ab4"
var baseUrl = 'https://api.forecast.io/forecast/' + apiKey
var container = document.querySelector('#container')

var search = document.querySelector('input')

search.value = "This doesn't work yet"

var latitude = ''
var longitude = ''

var changeView = function(clickEvent) {
	var route = window.location.hash.substr(1), 
		routeParts = route.split('/'),
		lat = routeParts[1], 
		lng = routeParts[2]

	var buttonEl = clickEvent.target, 
		newView = buttonEl.value 
	location.hash = newView + "/" + lat + "/" + lng 
}

var WeatherModel = Backbone.Model.extend({
	_generateUrl: function(lat,lng) {
		this.url = "https://api.forecast.io/forecast/976151b2336a5cba8b9ad9404c7cc25e/" + lat + "," + lng + "?callback=?"
	},
})
var CurrentlyView = Backbone.View.extend({

	el: "#container",
	initialize: function(someModel) { 
		this.model = someModel
		var viewInstance = this
		var boundRender = this._render.bind(viewInstance)
		this.model.on("sync",boundRender)
	},

	_render: function() { // since a view can easily access a model as one of its own properties, it can read data from that model, and use that data to write HTML into the DOM.
		var currentlyData = this.model.attributes.currently
		var htmlString = ''
	    htmlString += '<div id="today"><p>Right Now</p><p>' + Math.round(currentlyData.temperature) + '&ordmF</p>'
	    htmlString += '<p>' + currentlyData.summary + '</p>'
	   	this.el.innerHTML = htmlString
	}	
})

var DailyView = Backbone.View.extend({

	el: "#container",

	initialize: function(someModel) { 
		this.model = someModel
		var viewInstance = this
		var boundRender = this._render.bind(viewInstance)
		this.model.on("sync",boundRender)
	},

	_render: function() {
		console.log(this.model)
		var arrayOfObj = this.model.attributes.daily.data
		var htmlString = ''
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
				htmlString += '<div class="weeklyBars"><h1 class="maxTemp">'+ formattedDate +'</h1><h1 class="maxTemp">' + Math.round(day.apparentTemperatureMax)
				htmlString += '\xB0F/' + Math.round(day.apparentTemperatureMin) + '\xB0F</h1><h3 class="description">' + day.summary 
				htmlString += '</h3></div>'
		}
	this.el.innerHTML = htmlString
	}
})



var HourlyView = Backbone.View.extend({

	el: "#container",

	initialize: function(someModel) { 
		this.model = someModel
		var viewInstance = this
		var boundRender = this._render.bind(viewInstance)
		this.model.on("sync",boundRender)
	},

	_render: function() {
		console.log(this.model)
		var htmlString = '<div id="hoursContainer">'
 		var arrayOfObj = this.model.attributes.hourly.data
 			for (var i =0; i<24;i++){
		 		var hour = arrayOfObj[i]
		 		var time = hour.time
		 		time = time * 1000
		 		var d = new Date(time)
		 		var hours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours();
		 		var minutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
		 		var formattedTime = hours + ":" + minutes;

		 		htmlString += '<div class="hourlyBars"><h1>'+formattedTime+'</h1><h2>' + Math.round(hour.temperature) + '\xB0F</h2><h3>' 
		 		htmlString += hour.summary + '</h3></div>'
	 		}
 	htmlString += '</div>'
 	this.el.innerHTML = htmlString	
	}
})

var WeatherRouter = Backbone.Router.extend({		

	routes: {														
		"current/:lat/:lng": "handleCurrentWeather",				
		"hourly/:lat/:lng": "handleHourlyWeather",															
		"daily/:lat/:lng": "handleDailyWeather",
		"*default": "handleDefault"
	},

	handleCurrentWeather: function(lat,lng) { 
		var wm = new WeatherModel()
		wm._generateUrl(lat,lng)
		var cv = new CurrentlyView(wm)
		wm.fetch()
	},

	handleDailyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm._generateUrl(lat,lng)
		var dv = new DailyView(wm)
		wm.fetch()
	},

	handleHourlyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm._generateUrl(lat,lng)
		var dv = new HourlyView(wm)
		wm.fetch()
	},

	handleDefault: function() {
	 	// get current lat long, write into the route
	 	var successCallback = function(positionObject) {
	 		var lat = positionObject.coords.latitude 
	 		var lng = positionObject.coords.longitude 
	 		location.hash = "current/" + lat + "/" + lng
	 	}
	 	var errorCallback = function(error) {
	 		console.log(error)
	 	}
	 	window.navigator.geolocation.getCurrentPosition(successCallback,errorCallback)
	},

	initialize: function() {
		Backbone.history.start()
	}
})

var myRtr = new WeatherRouter() //Creating a new instance of the backbone router.


// global functions & eventlisteners
var buttonsContainer = document.querySelector("#buttons") //query select the button node

buttonsContainer.addEventListener('click',changeView) // add an event listener to the button container that will evoke the changeView function on a 'click'
