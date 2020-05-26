$(document).ready(() => {

   /*  */

   /* API URL CALL -> api.openweathermap.org/data/2.5/forecast?q={city name}&appid={your api key} */
   /* EXAMPLE: https://samples.openweathermap.org/data/2.5/forecast?id=524901&appid=439d4b804bc8187953eb36d2a8c26a02  */
   /* API CALL JSON INFO */
   const API_KEY = "&appid=dd53e65967b5b733950420e53babdfc5";
   const API_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q="  /* https://openweathermap.org/current */
   const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" /* https://openweathermap.org/forecast5 */
   let SEARCH_CITY;
   let userHistory = [];
   localStorage.setItem("LS_userHistory", "");
   /* grab user's location with window? then call APICall() to display temp data automatically when user visits page */


   /* LOADS USER LOCATION AND DISPLAY WEATHER  */
   let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
   };

   successGeo = (pos) => {
      console.log(`Latitude : ${pos.coords.latitude}`);
      console.log(`Longitude: ${pos.coords.longitude}`);

      /* api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={your api key} */
      PG_LOAD_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${Math.round(pos.coords.latitude, 2)}&lon=${Math.round(pos.coords.longitude, 2)}${API_KEY}`

      $.ajax({
         url: PG_LOAD_URL,
         method: "GET",
         success: (response) => {
            /*       console.log(response); */
            $(".map").empty();
            $("#current_description").text(response.weather[0].description);
            $("#weatherIcon").attr("src", `http://openweathermap.org/img/w/${response.weather[0].icon}.png`);
            $("#weatherIcon").css("display", `block-inline`);

            if (response.weather[0].icon[2] === "d") {
               $(".right-detail-panel").css({ "background-image": "url(assets/dayTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
               /*             $(".right-detail-panel").class("slide-fwd-center"); */

            } else if (response.weather[0].icon[2] === "n") {
               $(".right-detail-panel").css({ "background-image": "url(assets/nightTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
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

            let SEARCH_FUTURE_URL = API_FORECAST_URL + SEARCH_CITY + "&cnt=5" + API_KEY;
            $.ajax({
               url: SEARCH_FUTURE_URL,
               method: "GET",
               success: (future_response) => {

                  let futureWeather_ObjArr = [];
                  let futureWeather_Obj = {
                     date: "",
                     icon: "",
                     descrip: "",
                     temp: "",
                     humidity: ""
                  };

                  /*       console.log(future_response); */

                  for (let i = 0; i < 5; i++) {
                     futureWeather_Obj.date = future_response.list[i].dt_txt;
                     futureWeather_Obj.icon = future_response.list[i].weather[0].icon;
                     futureWeather_Obj.descrip = future_response.list[i].weather[0].description;
                     futureWeather_Obj.temp = future_response.list[i].main.temp;
                     futureWeather_Obj.humidity = future_response.list[i].main.humidity;
                     futureWeather_ObjArr.push(futureWeather_Obj);
                  }
               }
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

   }

   error = (err) => {
      console.log(`Error -> (${err.code}): ${err.message}`);
   }

   displayUsersCoords = () => {
      navigator.geolocation.getCurrentPosition(successGeo, error, options);
   }


   displayUsersCoords();




   /* LOADS USER HISTORY */
   loadHistory = () => {
      $(".left-search-panel-search-history").empty();

      let parsed_LS = localStorage["LS_userHistory"];

      if (parsed_LS === null || parsed_LS === undefined || parsed_LS === "") {
         console.log(`Local variable is empty: ${parsed_LS}`);
      } else {
         parsed_LS_F = JSON.parse(localStorage["LS_userHistory"]);
         console.log(`The array is filled: ${parsed_LS_F} & it's length is ${parsed_LS_F.length}`);


         if (parsed_LS_F.length < 5) {
            for (let i = 0; i < parsed_LS_F.length; i++) {

               setTimeout(() => {
                  $(".left-search-panel-search-history").append(
                     ` <li class="grid-x small-2 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${parsed_LS_F[i]}</li>`
                  )
               }, 200);
            }
         } else {
            for (let i = 0; i < 5; i++) {

               setTimeout(() => {
                  $(".left-search-panel-search-history").append(
                     ` <li class="grid-x small-2 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${parsed_LS_F[i]}</li>`
                  )
               }, 200);
            }
         }
      }
   }


   /* RANDOM CITY GENERATOR  */
   city_pageLoader = () => {
      $(".left-search-panel-cities").empty();
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
               ` <li class="grid-x small-2 medium-12 large-12 slide-right" style="text-overflow: ellipsis !important">${cities[Math.floor(Math.random() * 102)]}</li>`
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

   city_pageLoader();

   /* USER PRESSES SEARCH BUTTON */
   $("#searchBtn").on("click", () => {
      SEARCH_CITY = $("#citySearch").val().toString();
      $("#citySearch").css("background-color", "white");

      if (userHistory.indexOf(SEARCH_CITY) === -1) {
         userHistory.unshift(SEARCH_CITY);
         console.log(userHistory);
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
            /*       console.log(response); */
            $(".map").empty();
            $("#current_description").text(response.weather[0].description);
            $("#weatherIcon").attr("src", `http://openweathermap.org/img/w/${response.weather[0].icon}.png`);
            $("#weatherIcon").css("display", `block-inline`);

            if (response.weather[0].icon[2] === "d") {
               $(".right-detail-panel").css({ "background-image": "url(assets/dayTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
               /*             $(".right-detail-panel").class("slide-fwd-center"); */

            } else if (response.weather[0].icon[2] === "n") {
               $(".right-detail-panel").css({ "background-image": "url(assets/nightTimeBG.png)", "background-repeat": "no-repeat", "background-size": "cover" });
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

            let SEARCH_FUTURE_URL = `https://api.openweathermap.org/data/2.5/forecast?q=` + SEARCH_CITY + "&cnt=5" + API_KEY;
            $.ajax({
               url: SEARCH_FUTURE_URL,
               method: "GET",
               success: (future_response) => {

                  console.log(future_response)
                  let futureWeather_ObjArr = [];
                  let futureWeather_Obj = {
                     date: "",
                     icon: "",
                     descrip: "",
                     temp: "",
                     humidity: ""
                  };

                  /*       console.log(future_response); */

                  for (let i = 0; i < 5; i++) {
                     futureWeather_Obj.date = future_response.list[i].dt_txt;
                     futureWeather_Obj.icon = future_response.list[i].weather[0].icon;
                     futureWeather_Obj.descrip = future_response.list[i].weather[0].description;
                     futureWeather_Obj.temp = future_response.list[i].main.temp;
                     futureWeather_Obj.humidity = future_response.list[i].main.humidity;
                     futureWeather_ObjArr.push(futureWeather_Obj);
                     
                  }

                    /* console.log(futureWeather_ObjArr);
 */
                  /* console.log(future_response);
                  console.log(future_response.list[0].dt_txt);
                  console.log(future_response.list[0].weather[0].description); 
                  console.log(future_response.list[0].weather[0].icon); 
                  console.log(future_response.list[0].main.temp); 
                  console.log(future_response.list[0].main.humidity); */



                  /*   console.log($(`.card-section ul li span`)[0].innerText = `${future_response.list[`${0}`].dt_txt}`);
                    console.log($(`.card-section ul li span`)[1].innerText = `${future_response.list[`${0}`].weather[0].description}`);
                    console.log($(`.card-section img`)[0]);
                    console.log($(`.card-section ul li span`)[3]);
                    console.log($(`.card-section ul li span`)[4]);
                 */
                  /* for (let i = 0; i <= 15; i++) {
                       console.log($(`.card-section ul li`)[i]); 
                      $(`.card-section ul li`)[i].text(future_response.list[`${i}`].dt_txt);
                        $(`.card-section ul li`)[i].text(future_response.list[`${i}`].weather[0].description);
                        $(`.card-section ul li`)[i + 1].attr("src", `http://openweathermap.org/img/w/${future_response.list[`${i}`].weather[0].icon}.png`);
                        $(`.card-section ul li`)[i + 2].text(getFahrenheit(future_response.list[`${i}`].main.temp));
                        $(`.card-section ul li`)[i + 3].text(future_response.list[`${i}`].main.humidity);
                        i+=4; 
                  }*/

               }
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