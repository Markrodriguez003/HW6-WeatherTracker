$(document).ready(() => {

   /* API CALL JSON INFO */
   const API_KEY = "&appid=dd53e65967b5b733950420e53babdfc5";
   const API_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q="
   const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q="
   let SEARCH_CITY;
   let userHistory = [];
   /* localStorage.setItem("LS_userHistory", ""); */


   display_future_forecasts = () => {
      /* SETS 5 DAY FORECAST */
      let SEARCH_FUTURE_URL = API_FORECAST_URL + SEARCH_CITY + API_KEY;
      $.ajax({
         url: SEARCH_FUTURE_URL,
         method: "GET",
         success: (future_response) => {
           /*  console.log(`SEARCH URL: ${SEARCH_FUTURE_URL}`); */
            let holdTime;
            let holdDate;
            let setDate = "";
            $(".future-weather-cards").empty();
            /* 2020-05-27 12:00:00 */  /* 3 */
            let y = 0;
            for (let i = 0; i < future_response.list.length; i++) {

               holdTime = future_response.list[i].dt_txt.slice(11, 13);
               holdDate = future_response.list[i].dt_txt.slice(0, 10);


               if (holdTime === "12") {
                  setDate = future_response.list[i].dt_txt;
                 /*  console.log(future_response.list[i]); */
              /*     console.log(`THESE ARE THE FORECAST DATES: ${setDate}`); */

                  y = y + 1;
                  $(".future-weather-cards").append(

                     ` <div class="grid-y small-12 medium-6 large-2 future-forecast-day">
                      <div class="card">
                          <div class="card-divider">
                              <h6>DAY-${y}</h6> 
                          </div>
                          <div class="card-section ">
                              <ul class="weatherCards">
                                  <li><span class="future-date">${future_response.list[`${i}`].dt_txt.slice(0,17)}</span>pm</li><hr>
                                  <li><span class="future-weather-description">${future_response.list[`${i}`].weather[0].description}</span></li>
                                  <li><img src=${`https://openweathermap.org/img/w/${future_response.list[`${i}`].weather[0].icon}.png`} alt="" id="future-weather-icon"></li>
                                  <li><strong>Temp:</strong> <span id="future_temp">${getFahrenheit(future_response.list[`${i}`].main.temp)}</span>&#x2109</li>
                                  <li><strong>Humidity: </strong> <span id="future_humidity">${future_response.list[`${i}`].main.humidity}</span>%</li>
                              </ul>
                          </div>
                      </div>
                  </div>`
                  )
               }
            }
         }
      });
   }

   /* LOADS USER LOCATION AND DISPLAY WEATHER  */
   let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
   };

   successGeo = (pos) => {
     /*  console.log(`Latitude : ${pos.coords.latitude}`);
      console.log(`Longitude: ${pos.coords.longitude}`); */

      /* api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={your api key} */
      PG_LOAD_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${Math.round(pos.coords.latitude, 2)}&lon=${Math.round(pos.coords.longitude, 2)}${API_KEY}`

      $.ajax({
         url: PG_LOAD_URL,
         method: "GET",
         success: (response) => {

            $(".map").empty();
            $("#current_description").text(response.weather[0].description);
            $("#weatherIcon").attr("src", `http://openweathermap.org/img/w/${response.weather[0].icon}.png`);
            $("#weatherIcon").css("display", `block-inline`);

            if (response.weather[0].icon[2] === "d") {
               $(".right-detail-panel").css({ "background-image": "url(assets/dayTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
            } else if (response.weather[0].icon[2] === "n") {
               $(".right-detail-panel").css({ "background-image": "url(assets/nightTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
               $(".right-detail-panel").css("color", "white");

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

               /*  https://www.epa.gov/sunsafety/calculating-uv-index-0*/
               $("#current_UVI").text(uvi.value);
               if (uvi.value > 8.0) {
                  $("#current_UVI").css("background-color", "red");
               } else if (uvi.value > 6.5 && uvi.value < 8) {
                  $("#current_UVI").css("background-color", "orange");
               } else if (uvi.value > 4 && uvi.value < 6.5) {
                  $("#current_UVI").css("background-color", "yellow");
               } else {
                  $("#current_UVI").css("background-color", "green");
               }
            });

            display_future_forecasts();
            city_pageLoader();
         },
         error: () => {
            console.log(`Error found:`);

            $("#citySearch").css("background-color", "rgb(255, 98, 98)");
            $("#citySearch").val("");
            $("#citySearch").attr("placeholder", "Enter a city!");
         }
      })
   }

   error = (err) => {
      console.log(`Error -> (${err.code}): ${err.message}`);
   }

   displayUsersCoords = () => {
      navigator.geolocation.getCurrentPosition(successGeo, error, options);
   }

   displayUsersCoords();

   /* LOADS USER HISTORY */
   function loadHistory () {
      console.log("LOADING HISTORY!");
      $(".left-search-panel-search-history").empty();
      let parsed_LS = localStorage["LS_userHistory"];

      if (parsed_LS === null || parsed_LS === undefined || parsed_LS === "") {
         console.log(`Local variable is empty: ${parsed_LS}`);

      } else {
         
         parsed_LS_F = JSON.parse(localStorage["LS_userHistory"]);
        /*  console.log(parsed_LS_F) */
         if (parsed_LS_F.length < 5) {
            
            for (let i = 0; i < parsed_LS_F.length; i++) {
               console.log(`This is being called: ${i} times`)
               setTimeout(() => {
                  $(".left-search-panel-search-history").append(
                     ` <li class="grid-x small-6 medium-12 large-12 slide-right">${parsed_LS_F[i]}</li>`
                  )
               }, 200);
               parsed_LS_F.forEach((city)=>{
                  console.log(`FOR EACH CITY: ${city}`);
               console.log(`I'm at the end: ${i}`)

               })
            }
         } else {
            for (let i = 0; i < 5; i++) {

               setTimeout(() => {
                  $(".left-search-panel-search-history").append(
                     ` <li class="grid-x small-2 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${parsed_LS_F[i]}</li>`
                  )
               }, 200);
            } console.log("ha fuck you");
         }
      }
   }

   /* RANDOM CITY GENERATOR  */
   city_pageLoader = () => {
      $(".left-search-panel-cities").empty();
      $(".left-search-panel-search-history").empty();
      /* LOADS RANDOM CITIES */
      for (let i = 0; i < 6; i++) {
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
            "Cherry Hill",
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
               ` <li class="grid-x small-6 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${cities[Math.floor(Math.random() * 102)]}</li>`
            )
         }, 200)
      }
      loadHistory();
   }//eof city_pageLoader

   /* GRABS CLICKED ON RANDOMIZED CITY FROM LEFT PANEL AND LOADS IT IN SEARCH FIELD */
   $(document).on("click", ".left-search-panel-cities li", (e) => {
      e.stopPropagation();
      $("#citySearch").val(e.target.innerText.toString());

   })
   /* GRABS CLICKED SEARCH HISTORY CITY AND LOADS IT IN SEARCH FIELD */
   $(document).on("click", ".left-search-panel-search-history li", (e) => {
      e.stopPropagation();
      $("#citySearch").empty();
      $("#citySearch").val(e.target.innerText.toString());
   })
   /* city_pageLoader(); */

   /* USER PRESSES SEARCH BUTTON */
   $("#searchBtn").on("click", () => {
      SEARCH_CITY = $("#citySearch").val().toString();
      $("#citySearch").css("background-color", "white");

      if (userHistory.indexOf(SEARCH_CITY) === -1) {
         userHistory.unshift(SEARCH_CITY);
         localStorage.setItem("LS_userHistory", JSON.stringify(userHistory));
      }

      API_call(SEARCH_CITY);

   })
   /* USER PRESSES ENTER */
   $(document).on('keypress', function (e) {
      if (e.which === 13) {
         SEARCH_CITY = $("#citySearch").val();
         $("#citySearch").css("background-color", "white");
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
            $(".map").empty();
            $("#current_description").text(response.weather[0].description);
            $("#weatherIcon").attr("src", `http://openweathermap.org/img/w/${response.weather[0].icon}.png`);
            $("#weatherIcon").css("display", `block-inline`);

            if (response.weather[0].icon[2] === "d") {
               $(".right-detail-panel").css({ "background-image": "url(assets/dayTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });

            } else if (response.weather[0].icon[2] === "n") {
               $(".right-detail-panel").css({ "background-image": "url(assets/nightTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
               $(".right-detail-panel").css("color", "white");
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

               /*  https://www.epa.gov/sunsafety/calculating-uv-index-0*/
               $("#current_UVI").text(uvi.value);
               if (uvi.value > 8.0) {
                  $("#current_UVI").css("background-color", "red");
               } else if (uvi.value > 6.5 && uvi.value < 8) {
                  $("#current_UVI").css("background-color", "orange");
               } else if (uvi.value > 4 && uvi.value < 6.5) {
                  $("#current_UVI").css("background-color", "yellow");
               } else {
                  $("#current_UVI").css("background-color", "green");
               }
            });

            display_future_forecasts();
            city_pageLoader();
         },
         error: () => {
            console.log(`Error found!`);

            $("#citySearch").css("background-color", "rgb(255, 98, 98)");
            $("#citySearch").val("");
            $("#citySearch").attr("placeholder", "Enter a city!");

         }
      })
   } // api call function end

   /* TEMPERATURE CONVERSION - Just use "units" api call instead of this?*/
   function getFahrenheit (t) {
      /* ° F = 1.8(K - 273) + 32 */
      tx = Math.round(1.8 * (t - 273) + 32);
      return tx;
   }
}) // DOCUMENT READY END