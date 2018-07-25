/*
get geolocation from google geolocation api and javascript promise
then send latitude and longitude to openweather api with js promise
*/

"use strict";

// just a quick notification for sucky browsers
(function() {
  if (typeof Promise === "undefined" || Promise.toString().indexOf("[native code]") === -1) {
    alert("Your browser does not support promises. This pen won't work.")
  }
})();

let geoUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCbrcHPlSrzV06iOFSMXLvGOnOUSyv5UvE";
let weatherUrl = 'https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?';

function makePostRequest(url) {
  return new Promise(
    (resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('POST', url);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.responseType = 'json';
      request.onload = (function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(request.response);
        } else {
          reject({
            status: this.status,
            statusText: request.statusText
          });
        }
      });
      request.onerror = (function() {
        reject({
          status: this.status,
          statusText: request.statusText
        });
      });
      request.send();
    }
  )
}

function getGeoData(url) {
  return makePostRequest(url)
}

function sendWeatherRequest(latLngObj) {
  let urlForWeatherRequest = weatherUrl + "lat=" + latLngObj.lat + "&lon=" + latLngObj.lng + "&APPID=" + "163f98f0d415aec0ceb630bc76fbdd1d" + "&units=metric";
  return makePostRequest(urlForWeatherRequest);
}

function getWeatherData() {
  return getGeoData(geoUrl)
    .then((response) => {
      //console.log(response);
      let lat = response.location.lat,
          lng = response.location.lng;
      return {
        lat,
        lng
      }
    })
    .then((latAndLng) => {
      return sendWeatherRequest(latAndLng)
        .then((weatherResponse) => {
          return weatherResponse;
        })
    })
}

// let's go
setTimeAndDate();
//just call getWeatherData on pen load
getWeatherData()
//simulateWeatherData() //fake object just for testin'
.then( (res)=>{
  let mainCond = res.weather[0].main.toLowerCase();  
  //console.log(res);
  updateLocation(res.name);
  updateTemperature(Math.round(res.main.temp));
  addTemperatureClickListener();
  changeConditionsText(res.weather[0].main);
  switch (mainCond){ //yea, this could get some refactoring
    case "snow":
      changeIcon("snow");
      changeContainerClass("snow");
    break;
    case "clouds":
      changeIcon("wind");
      changeContainerClass("wind");
      break;
    case "rain":
      changeIcon("rain");
      changeContainerClass("rain");
      break;
    default:
      changeIcon("sun");
      changeContainerClass("sun");
  }
})

function updateLocation(location){
  let place = document.getElementById('place');
  place.innerHTML = location;
}

function switchUnits(){
  let temperature = document.getElementById("temperature"),
      unit = temperature.getAttribute("data-unit"),
      unitCont = document.getElementById('unit'),
      valueCont = document.getElementById('value'),
      value = valueCont.innerHTML;
  
  if(unit === "C"){
    value = calculateF(value);
    unitCont.innerHTML = "F";
    temperature.setAttribute('data-unit', 'F');
  } else {
    value = calculateC(value);
    unitCont.innerHTML = "C";    
    temperature.setAttribute('data-unit', 'C');
  }
  valueCont.innerHTML = value;
  
  function calculateF(value){
    return Math.round(value*1.8 + 32);
  };
  function calculateC(value){
    return Math.round((value - 32)/(1.8));
  };
}

function addTemperatureClickListener(){
  let temperatureCont = document.getElementById('temperature');
  temperatureCont.addEventListener("click", switchUnits);
}

function setTimeAndDate(){
  let hourCont = document.getElementById('hour'),
      dateCont = document.getElementById('date'),
      date = new Date,
      hours = date.getHours(),
      minutes = date.getMinutes(),
      day = date.getDate(),
      dayOfWeek = date.getDay(),
      month = date.getMonth()+1;
  
  dayOfWeek = (function(value){
    switch (value){
      case 1: return 'MON';
      case 2: return 'TUE';
      case 3: return 'WED';
      case 4: return 'THU';
      case 5: return 'FRI';
      case 6: return 'SAT';
      default: return 'SUN';
    };
  })(dayOfWeek);
  
  hourCont.innerHTML = hours + ":" + minutes;
  dateCont.innerHTML = dayOfWeek + " " + day + "." + month;
}

function updateTemperature(value){
  let temperatureCont = document.getElementById('value');
  temperatureCont.innerHTML = value;
}

function changeConditionsText(text){
  let conditionsText = document.getElementById("conditions");
  conditionsText.innerHTML = capitalizeFirstLetter(text);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function changeIcon(pairsCode){
  let icon = document.getElementById("mainIcon");  
  icon.className = "wi " + pairs[pairsCode].icon;
}

function changeContainerClass(pairsCode){
  let container = document.querySelector(".container");
  container.className = "container " + pairs[pairsCode].class;
}

function simulateWeatherData(){
  return new Promise(
    (resolve) => {
      setTimeout(() => {
          resolve({
            "coord":{"lon":139,"lat":35},
            "sys":{"country":"JP","sunrise":1369769524,"sunset":1369821049},
            "weather":[{"id":804,"main":"rain","description":"overcast clouds","icon":"04n"}],
            "main":{"temp":32,"humidity":89,"pressure":1013,"temp_min":287.04,"temp_max":292.04},
            "wind":{"speed":7.31,"deg":187.002},
            "rain":{"3h":0},
            "clouds":{"all":92},
            "dt":1369824698,
            "id":1851632,
            "name":"Shuzenji",
            "cod":200
          })
      }, 1000)
    }
  )
}

let pairs = {
  sun: {
    icon: 'wi-day-sunny',
    class: 'sunny'
  },
  snow: {
    icon: 'wi-day-snow',
    class: 'snowy'
  },
  rain: {
    icon: 'wi-day-showers',
    class: 'rainy'
  },
  wind: {
    icon: 'wi-day-cloudy-windy',
    class: 'windy'
  }
}
