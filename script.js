$(document).ready(() => {

   /*  */

   /* API URL CALL -> api.openweathermap.org/data/2.5/forecast?q={city name}&appid={your api key} */
   /* EXAMPLE: https://samples.openweathermap.org/data/2.5/forecast?id=524901&appid=439d4b804bc8187953eb36d2a8c26a02  */
   /* API CALL JSON INFO */
   const API_KEY = "&appid=dd53e65967b5b733950420e53babdfc5";
   const API_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q="  /* https://openweathermap.org/current */
   const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=" /* https://openweathermap.org/forecast5 */
   let SEARCH_CITY;

   /* grab user's location with window? then call APICall() to display temp data automatically when user visits page */

 

   city_pageLoader = () => {
      $(".left-search-panel-cities").empty();
      /* LOADS RANDOM CITIES */
      for (let i = 0; i < 12; i++) {
         const cities = [
            "Miami",
            "Orlando",
            "Jacksonville",
            "Atlanta",
            "Macon",
            "Augusta",
            "Charleston",
            "Myrtle Beach",
            "Charlotte",
            "Raleigh",
            "Richmond",
            "Norfolk",
            "Memphis",
            "Nashville",
            "Louiseville",
            "Lexington",
            "Frankfort",
            "Houston",
            "Bismarck",
            "San Jose",
            "San Diego",
            "Fargo",
            "Sioux Falls",
            "Rapid City",
            "Saint Paul",
            "Minneapolis",
            "Chicago",
            "Peoria",
            "Little Rock",
            "Fayetteville",
            "Columbus",
            "Cleveland",
            "Cincinnati",
            "Des Moines",
            "Cedar Rapids",
            "Jackson",
            "Cheyenne",
            "Wichita",
            "Topeka",
            "Phoenix",
            "Tucson",
            "Albuquerque",
            "Santa Fe",
            "Ogden",
            "Salt Lake City",
            "Helena",
            "Billings",
            "Albany",
            "New York",
            "Buffalo",
            "Bangor",
            "Seattle",
            "Olympia",
            "Reno",
            "Las Vegas",
            "Denver",
            "Boulder",
            "Montgomery",
            "Birmingham",
            "New Orleans",
            "Baton Rouge",
            "Philadelphia",
            "Atlantic City",
            "Vineland",
            "Cherry Hilly",
            "Scranton",
            "Hartford",
            "Springfield",
            "Montauk",
            "Long Island",
            "Providence",
            "Boston",
            "Concord",
            "Manchester",
            "Montpelier",
            "Woodstock",
            "Pittsburg",
            "Detroit",
            "Toledo",
            "Milwaukee",
            "Madison",
            "Tulsa",
            "Austin",
            "San Antonio",
            "Broken Arrow",
            "Los Angeles",
            "Anaheim",
            "Sacramento",
            "Portland",
            "Bend",
            "Medford",
            "Salem",
            "Eugene",
            "Tacoma",
            "Spokane",
            "Warden",
            "Bozeman",
            "Casper",
            "Omaha",
            "Lincoln",
            "Sioux City",
            "Fayetteville"
         ]
         setTimeout(() => {
            $(".left-search-panel-cities").append(
               ` <li class="grid-x small-2 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${cities[Math.floor(Math.random() * 102)]}</li>`
            )
         }, 200)
      }

   }//eof city_pageLoader

   /* GRABS RANDOM CITY FROM LEFT PANEL AND LOADS IT IN SEARCH FIELD */
   $(document).on("click", $(".left-search-panel-cities li"), (e) => {
      console.log(e.target.innerText);
      $("#citySearch").val(e.target.innerText);
   })

   city_pageLoader();

   /* USER PRESSES SEARCH BUTTON */
   $("#searchBtn").on("click", () => {
      SEARCH_CITY = $("#citySearch").val();
      $("#citySearch").css("background-color", "white");
      console.log(`Search City: ${SEARCH_CITY}`);

      API_call(SEARCH_CITY);
      
   })
   /* USER PRESSES ENTER */
   $(document).on('keypress', function (e) {
      if (e.which === 13) {
         console.log("You Pressed Enter!");
         SEARCH_CITY = $("#citySearch").val();
         $("#citySearch").css("background-color", "white");
         console.log(`Search City: ${SEARCH_CITY}`);
         API_call(SEARCH_CITY);
        
      }
   });

   /* CALLS API AND LOADS CURRENT WEATHER DATA TO PAGE */
   API_call = (SEARCH_CITY) => {
      const SEARCH_URL = API_CURRENT_URL + SEARCH_CITY + API_KEY;
      $.ajax({
         url: SEARCH_URL,
         method: "GET",
         success: (response) => {
            console.log(response);
            $(".map").empty();
            $("#current_description").text(response.weather[0].description);
            $("#weatherIcon").attr("src", `http://openweathermap.org/img/w/${response.weather[0].icon}.png`);
            $("#weatherIcon").css("display", `block-inline`);

            if(response.weather[0].icon[2] === "d"){
               $(".right-detail-panel").css({"background-image": "url(assets/dayTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover"});
   /*             $(".right-detail-panel").class("slide-fwd-center"); */
               
            } else if(response.weather[0].icon[2] === "n"){
               $(".right-detail-panel").css({"background-image": "url(assets/nightTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover"});
               $(".right-detail-panel").css("color", "white");
            /*    $(".right-detail-panel").class("slide-fwd-center"); */

               
            } else {
               $(".right-detail-panel").css("background-color", "tomato");

            }

            $("#current_temp").text(getFahrenheit(response.main.temp));
            $("#current_humidity").text(response.main.humidity);
            $("#current_windSpeed").text(response.wind.speed);
            $("#current_windDeg").text(response.wind.deg);

            var map = new ol.Map({
               target: 'map',
               layers: [
                 new ol.layer.Tile({
                   source: new ol.source.OSM()
                 })
               ],
               view: new ol.View({
                 center: ol.proj.fromLonLat([`${response.coord.lon}`, `${response.coord.lat}`]),
                 zoom: 10
               })
             });

            const UVI_URL = `https://api.openweathermap.org/data/2.5/uvi?${API_KEY}&lat=${response.coord.lat}&lon=${response.coord.lon}`;
            $.ajax({
               url: UVI_URL,
               method: "GET"
            }).then((uvi) => {
               $("#current_UVI").text(uvi.value);
            });
            city_pageLoader();
         },
         error: () => {
            console.log(`Error found:`);

            $("#citySearch").css("background-color", "rgb(255, 98, 98)");
            $("#citySearch").val("");
            $("#citySearch").attr("placeholder", "Enter a city!");

         }
      })



   } // api call function end



   /* TEMPERATURE CONVERSION */
   getFahrenheit = (t) => {
      /* ° F = 1.8(K - 273) + 32 */
      tx = Math.round(1.8 * (t - 273) + 32);
      return tx;
   }


}) // DOCUMENT READY END