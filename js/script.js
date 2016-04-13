//Global
var apiKey = "b334b35106f8ae0fa14affa96fae3ab4"
var baseUrl = 'https://api.forecast.io/forecast/' + apiKey
var container = document.querySelector('#container')
var chromeSecurityCode = '?callback=?'


var search = document.querySelector('input')

search.placeholder = "Search City"

var latitude = ''
var longitude = ''

function searchNewCity (keyEvent) {
	var inputEl = keyEvent.target
	if (keyEvent.keyCode === 13) {
		var newSearchQuery = inputEl.value
		var currentCity = document.querySelector("#city")
		currentCity.innerHTML = '<p>' +newSearchQuery+'</p>'
		location.hash = "current/" + newSearchQuery
		inputEl.value = ''
	}
}

search.addEventListener('keydown',searchNewCity)


var changeView = function(clickEvent) {

	var route = window.location.hash.substring(1),
		routeParts = route.split('/')
		// lat = routeParts[1]
		// lng = routeParts[2]
		searchCity = routeParts[1]
	var buttonClicked = clickEvent.target
	var userSearch = buttonClicked.value
	//location.hash = userSearch + "/" + lat + '/' + lng
	location.hash = userSearch + "/" + searchCity

	// var route = window.location.hash.substr(1), 
	// 	routeParts = route.split('/'),
	// 	lat = routeParts[1], 
	// 	lng = routeParts[2]

	// var buttonEl = clickEvent.target, 
	// 	newView = buttonEl.value 
	// location.hash = newView + "/" + lat + "/" + lng 
}

//Models--------->
var WeatherModel = Backbone.Model.extend({
	generateUrl: function(lat,lng) {
		this.url = "https://api.forecast.io/forecast/976151b2336a5cba8b9ad9404c7cc25e/" + lat + "," + lng + "?callback=?"
	},
})

var SearchModel = Backbone.Model.extend({
	generateUrl: function(city) {
		this.url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city
	}
})
//Default Views-------->
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

//Search Views---------->

var CurrentSearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentlyView(wm)
		wm.fetch() 
	}
})
var DailySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new DailyView(wm)
		wm.fetch() 
	}
})
var HourlySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new HourlyView(wm)
		wm.fetch() 
	}
})

var WeatherRouter = Backbone.Router.extend({		

	routes: {	

		"current/:searchCity": "handleCurrentSearchCity",
		"daily/:searchCity": "handleDailySearchCity",
		"hourly/:searchCity": "handleHourlySearchCity",													
		"current/:lat/:lng": "handleCurrentWeather",				
		"hourly/:lat/:lng": "handleHourlyWeather",															
		"daily/:lat/:lng": "handleDailyWeather",
		"*default": "handleDefault"
	},

	handleCurrentWeather: function(lat,lng) { 
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentlyView(wm)
		wm.fetch()
	},

	handleDailyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var dv = new DailyView(wm)
		wm.fetch()
	},

	handleHourlyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var dv = new HourlyView(wm)
		wm.fetch()
	},

	handleCurrentSearchCity: function(searchCity) {
		var scm = new SearchModel()
		scm.generateUrl(searchCity)
		var csv = new CurrentSearchView(scm)
		scm.fetch()
	},

	handleDailySearchCity: function(searchCity) {
		var scm = new SearchModel()
		scm.generateUrl(searchCity)
		var csv = new DailySearchView(scm)
		scm.fetch()
	},

	handleHourlySearchCity: function(searchCity) {
		var scm = new SearchModel()
		scm.generateUrl(searchCity)
		var csv = new HourlySearchView(scm)
		scm.fetch()
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
