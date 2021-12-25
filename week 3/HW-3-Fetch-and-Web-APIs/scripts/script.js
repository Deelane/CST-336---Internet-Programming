  $(function()
  {
    //Key for reverse geocoding
    const positionStackKey = "2fbd94b7629b2f74c64a00092c8dccf1";
    const bingMapsKey = "AuaDuAL_YXvZjmtm-Ben01GV9RLwMJdIQu5qgzf5jt5doJ-CdTPVT99Ct4bp79ZY";
    const carbonInterfaceKey = "4pkq2J68mRWzmRDgvdnv3w";

    /**USER COORDINATES **/
    //successfully retrieved coordinates
    //get lat and long

    //if user and browser allow location data retrieval
    if (navigator.geolocation)
    {
      //attempt to retrieve/return coordinates
      navigator.geolocation.getCurrentPosition(showPosition, showError, {timeout: 5000});
    }
    //something went wrong
    else
    {
      location.html("Geolocation is not supported by this browser.");
    }

    async function showPosition(position)
    {
      let latitude = String(position.coords.latitude);
      let longitude = String(position.coords.longitude);
      $("#latitude").val(latitude);
      $("#longitude").val(longitude);

      /**USER AREA THROUGH REVERSE GEOLOCATION**/
      //Get user's human readable location from coordinates
      //Query positionstack API

      let url = "https://api.positionstack.com/v1/reverse?access_key=" + positionStackKey + "&query=" + latitude + "," + longitude;
      await fetch(url)
          .then(response => response.json())
          .then(data => $("#location").val(data.data[0].locality + ", " + data.data[0].region)) //For some reason they append "data" to the start of their JSON results
          .catch(e =>
          {
            console.log(e);
          });
    }

    //failed to update coordinates
    function showError(error)
    {
      switch(error.code)
      {
        case error.PERMISSION_DENIED:
          alert("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
      }
    }


    /**CAR MAKE & MODEL */
    //Display vehicle makes
    url = "https://www.carboninterface.com/api/v1/vehicle_makes";

    let options = {
      method: "GET",
      headers:
      {
        "Authorization": "Bearer " + carbonInterfaceKey,
        "Content-Type": "application/json"
      }
    };
     fetch(url, options)
     .then(res => res.json())
     .then(data => data.forEach(carMake => $("#carMakes").append(`<option value='${carMake.data.id}'>${carMake.data.attributes.name}</option>`))
     );

     //Display all models for selected make
     $("#carMakes").on("change", async function() {

       //reset models list
       $("#vehicleModels").html("<option value='none' selected>Select One</option>");

       //get id of care make for querying API
       let vehicleMakeId = $("#carMakes").val();
       //Ensure a valid selection
       if (vehicleMakeId !== "none")
       {
         let url = "https://www.carboninterface.com/api/v1/vehicle_makes/" + vehicleMakeId + "/vehicle_models";
         let options = {
           method: "GET",
           headers:
               {
                 "Authorization": "Bearer " + carbonInterfaceKey,
                 "Content-Type": "application/json"
               }
         };
         await fetch(url, options)
             .then(res => res.json())
             .then(data => data.forEach(carModel => $("#vehicleModels").append(`<option value='${carModel.data.id}'>${carModel.data.attributes.year} ${carModel.data.attributes.name}</option>`))
             );
       }
     });


    /**CALCULATE EMISSIONS**/
    $("#calculateEmissionsButton").on("click", async function()
    {
      let error = false;

      $("#emissions").html("");
      $("#carEmissionsVisual").html("");

      //Get destination
      let destinationAddress = $("#destination").val();

      //Get car make and model
      let carMake = $("#carMakes").val();
      let vehicleModel = $("#vehicleModels").val();

      let tripDistance = 0;

      if (destinationAddress == "")
      {
        error = true;
        alert("Must enter a destination address!")
      }

      if (carMake == "none")
      {
        error = true;
        alert("Must select a car make!");
      }

      if (vehicleModel == "none")
      {
        error = true;
        alert("Must select a car model!");
      }

      //Reset map
      $("#mapDiv").html("");

      //Ensure all fields are entered
      if (!error)
      {
        //Query and store destination coordinates
        let destinationLatitude = "";
        let destinationLongitude = "";

        //retrieve car model id
        let carModelId = $('#vehicleModels option:selected').val();

        let url = "https://api.positionstack.com/v1/forward?access_key=" + positionStackKey + "&query=" + destinationAddress;
        await fetch(url)
            .then(response => response.json())
            .then(data =>
            {
              destinationLatitude = data.data[0].latitude;
              destinationLongitude = data.data[0].longitude;
            }) //For some reason they append "data" to the start of their JSON results
            .catch(e =>
            {
              console.log(e);
            });

        //Calculate distance between locations
        url = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + $("#latitude").val() + "," + $("#longitude").val() + "&destinations=" + destinationLatitude + "," + destinationLongitude + "&travelMode=driving&timeUnit=minute&key=" + bingMapsKey;
        await fetch(url)
            .then(response => response.json())
            .then(data =>
            {
              console.log(data);
              tripDistance = parseInt(data.resourceSets[0].resources[0].results[0].travelDistance);
            })
            .catch(e =>
            {
              console.log(e);
            });

        //Display route map
        //don't await, let it load whenever
        url = "https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/Routes/Driving?waypoint.1=" + $("#latitude").val() + "," + $("#longitude").val() + "&waypoint.2=" + destinationLatitude + "," + destinationLongitude + "&mapSize=650,650&avoid=tolls&mapLayer=TrafficFlow&key=" + bingMapsKey;
        fetch(url)
          .then(response => response.blob())
          .then(imageBlob =>
          {
            image = URL.createObjectURL(imageBlob);
            $("#mapDiv").append(`<img src='${image}' alt="Map of Route">`);
          })
          .catch(e =>
          {
            console.log(e);
          });

        //Calculate emissions
        url = "https://www.carboninterface.com/api/v1/estimates";
        let options = {
          method: "POST",
          headers:
              {
                "Authorization": "Bearer " + carbonInterfaceKey,
                "Content-Type": "application/json"
              },
          body:JSON.stringify(
              {
                "type": "vehicle",
                "distance_unit": "km",
                "distance_value": tripDistance,
                "vehicle_model_id": carModelId
              })
        };
        let emissionsLb = 0;

        await fetch(url, options)
            .then(res => res.json())
            .then(data =>
            {
              //console.log(data);
              emissionsLb = data.data.attributes.carbon_lb;
              $("#emissions").append(`<p><b>Vehicle:</b> ${data.data.attributes.vehicle_year} ${data.data.attributes.vehicle_model}<br><b>Distance Traveled</b>: ${data.data.attributes.distance_value}${data.data.attributes.distance_unit}</p>`)
              $("#emissions").append(`<p><b>Estimated Carbon Emissions:</b><br> ${data.data.attributes.carbon_kg} kg<br>${emissionsLb} lb</p>`);
            });
        let amountCars = emissionsLb / 5;
        let rowCounter = 0;
        let maxCars = 70;
        for (let i = 0; i < amountCars; i++)
        {
          if(i >= maxCars)
          {
            break;
          }

          $("#carEmissionsVisual").append(`<img src='css/img/car_emissions.png' alt='small car'>`);
          rowCounter++;

          //Ensure 10 cars per row
          if (rowCounter == 10)
          {
            $("#carEmissionsVisual").append('<br>');
            rowCounter = 0;
          }

        }
      }
    });

  });
