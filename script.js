$(document).ready(() => {


   /* API URL CALL -> api.openweathermap.org/data/2.5/forecast?q={city name}&appid={your api key} */
   /* EXAMPLE: https://samples.openweathermap.org/data/2.5/forecast?id=524901&appid=439d4b804bc8187953eb36d2a8c26a02  */
   /* API CALL JSON INFO */
   const API_KEY = "&appid=dd53e65967b5b733950420e53babdfc5";
   const API_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q="  /* https://openweathermap.org/current */
   const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=" /* https://openweathermap.org/forecast5 */
   let SEARCH_CITY;

   /* grab user's location with window? then call APICall() to display temp data automatically when user visits page */
 

   /* USER PRESSES SEARCH BUTTON */
   $("#searchBtn").on("click", () => {
      SEARCH_CITY = $("#citySearch").val();
      $("#citySearch").css("background-color", "white");
      console.log(`Search City: ${SEARCH_CITY}`);

      API_call(SEARCH_CITY);
   })
   /* USER PRESSES ENTER */
   $(document).on('keypress',function(e) {
      if(e.which === 13) {
         console.log("You Pressed Enter!");
         SEARCH_CITY = $("#citySearch").val();
         $("#citySearch").css("background-color", "white");
         console.log(`Search City: ${SEARCH_CITY}`);
   
         API_call(SEARCH_CITY);
      }
  });

   API_call = (SEARCH_CITY) => {
      const SEARCH_URL = API_CURRENT_URL + SEARCH_CITY + API_KEY;
      $.ajax({
         url: SEARCH_URL,
         method: "GET",
         success: (response) => {
            console.log(response);
            $("#current_description").text(response.weather[0].description);
            $("#current_temp").text(getFahrenheit(response.main.temp));
            $("#current_humidity").text(response.main.humidity);
            $("#current_windSpeed").text(response.wind.speed);
            $("#current_windDeg").text(response.wind.deg);

            const UVI_URL = `https://api.openweathermap.org/data/2.5/uvi?${API_KEY}&lat=${response.coord.lat}&lon=${response.coord.lon}`;
            $.ajax({
               url: UVI_URL,
               method: "GET"
            }).then((uvi) => {
               $("#current_UVI").text(uvi.value);
            });

         },
         error: () => {
            console.log(`Error found:`);

            $("#citySearch").css("background-color", "rgb(255, 98, 98)");
            $("#citySearch").val("");
            $("#citySearch").attr("placeholder", "Error! No City Exists!");

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