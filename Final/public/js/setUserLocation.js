/**API KEY**/
//Not worth the time to hide the API key from the client so it's getting hardcoded
const key = "2fbd94b7629b2f74c64a00092c8dccf1";

//This is a promise
var getPosition = function (options)
{
    return new Promise(function (resolve, reject)
    {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

};

function cacheUserLocation(location)
{
    //location was not passed
    //if user and browser allow location data retrieval
    if (navigator.geolocation)
    {
        getPosition()
            .then((position) =>
            {
                updateCache(String(position.coords.latitude), String(position.coords.longitude));
            })
            .catch((err) =>
            {
                console.error(err.message);
            });
    }
    //user denied geolocation but passed a location
    else if (location !== "" && location !== null && location !== undefined)
    {
        console.log("Location Passed Successfully");
        //parse the coordinates from the location string then cache them
        parseLocation("humanReadable", location)
            .then(coordinates => updateCache(coordinates[0], coordinates[1]));
    }
    //user denied geolocation and didnt pass a location
    {
        console.log("Geolocation denied or an error occurred.");
        return false;
    }

    function updateCache(latitude, longitude)
    {
        //local storage update
        localStorage.setItem("userLatitude", latitude);
        localStorage.setItem("userLongitude", longitude);
        parseLocation("coordinates", [latitude, longitude])
            .then(location =>
            {
                localStorage.setItem("userLocality", location[0]);
                localStorage.setItem("userRegion", location[1]);
            });
    }
}

function getUserCoordinates()
{
    return [localStorage.getItem("userLatitude"), localStorage.getItem("userLongitude")];
}
function userLocationCached()
{
    return localStorage.getItem("userLatitude") && localStorage.getItem("userLongitude") && localStorage.getItem("userLocality") && localStorage.getItem("userRegion");
}

function parseLocation(locationType, location)
{
    let key = "2fbd94b7629b2f74c64a00092c8dccf1";

    if (locationType === "coordinates")
    {
        let latitude;
        let longitude;
        //make sure an array was passed
        if (location[0] != undefined && location[1] != undefined)
        {
            latitude = location[0];
            longitude = location[1];
        }
        else
        {
            console.log("Location type 'coordinates' must pass an array as second argument.")
        }

        //Get user's human readable location from coordinates
        //Query positionstack API

        //build query
        let url = "https://api.positionstack.com/v1/reverse?access_key=" + key + "&query=" + latitude + "," + longitude;

        //execute query
        return fetch(url)
            .then(response => response.json())
            .then(data =>
            {
                let userLocality = data.data[0].locality;
                let userRegion = data.data[0].region;
                //return location as a string
                return [userLocality, userRegion];
            }) //For some reason they append "data" to the start of their JSON results
            .catch(error =>
            {
                console.log(error);
            });
    }
    else if (locationType === "humanReadable")
    {
        let url = "https://api.positionstack.com/v1/forward?access_key=" + key + "&query=" + location;
        return fetch(url)
            .then(response => response.json())
            .then(data =>
            {
                //return coordinates as an array
                return [data.data[0].latitude, data.data[0].longitude];
            }) //For some reason they append "data" to the start of their JSON results
            .catch(e =>
            {
                console.log(e);
            });
    }
    else
    {
        console.log("Invalid argument(s).");
        return "";
    }

}

function setLocationInElement(elementToUpdate, location)
{

    //ensure element to update is a DOM element
    if (!isElement(elementToUpdate))
    {
        console.log("Error: object to update must be a DOM element");
        return;
    }

    //update DOM
    let elementType = elementToUpdate[0].tagName.toLowerCase();
    switch (elementType)
    {
        case "input":
            elementToUpdate.val(location);
            break;
        default:
            elementToUpdate.html(location);
            break;
    }

    //ensure object to update is a DOM element
    function isElement(element)
    {
        if(element instanceof HTMLCollection && element.length)
        {
            for(let i = 0, len = element.length; i < len; i++)
            {
                if(!checkInstance(element[i]))
                {
                    return false;
                }
            }
            return true;
        }
        else
        {
            return checkInstance(element);
        }
        function checkInstance(elem)
        {
            if((elem instanceof jQuery && elem.length) || elem instanceof HTMLElement)
            {
                return true;
            }
            return false;
        }
    }
}

function setUserLocation(elementToUpdate, displayType)
{
    //ensure element to update is a DOM element
    if (!isElement(elementToUpdate))
    {
        console.log("Error: object to update must be a DOM element");
        return;
    }

    /**USER COORDINATES **/
    //successfully retrieved coordinates
    //get lat and long

    //if user and browser allow location data retrieval
    if (navigator.geolocation)
    {
        //attempt to retrieve/return coordinates
        navigator.geolocation.getCurrentPosition(showPosition, showError, {timeout: 5000});
    }

    async function showPosition(position)
    {
        let latitude = String(position.coords.latitude);
        let longitude = String(position.coords.longitude);

        let elementType = elementToUpdate[0].tagName.toLowerCase();

        //Display coordinates and return
        if (displayType === "coordinates")
        {
            if (elementType === "input")
            {
                elementToUpdate.val(latitude + ", " + longitude);
            }
            else
            {
                elementToUpdate.html(latitude + ", " + longitude);
            }
        }
        /**USER HUMAN READABLE AREA THROUGH REVERSE GEOLOCATION**/
        else if (displayType === "humanReadable")
        {
            //Get user's human readable location from coordinates
            //Query positionstack API

            //build query
            let url = "https://api.positionstack.com/v1/reverse?access_key=" + key + "&query=" + latitude + "," + longitude;

            //execute query
            await fetch(url)
                .then(response => response.json())
                .then(data =>
                {
                    let userLocality = data.data[0].locality;
                    let userRegion = data.data[0].region;

                    if (elementType === "input")
                    {
                        elementToUpdate.val(userLocality + ", " + userRegion);
                    }
                    else
                    {
                        elementToUpdate.html(userLocality + ", " + userRegion);
                    }
                }) //For some reason they append "data" to the start of their JSON results
                .catch(error =>
                {
                    console.log(error);
                });
        }
    }

    /**ERROR HANDLING**/
    //failed to update coordinates
    function showError(error)
    {
        switch (error.code) {
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
    //ensure object to update is a DOM element
    function isElement(element)
    {
        if(element instanceof HTMLCollection && element.length)
        {
            for(let i = 0, len = element.length; i < len; i++)
            {
                if(!checkInstance(element[i]))
                {
                    return false;
                }
            }
            return true;
        }
        else
        {
            return checkInstance(element);
        }
        function checkInstance(elem)
        {
            if((elem instanceof jQuery && elem.length) || elem instanceof HTMLElement)
            {
                return true;
            }
            return false;
        }
    }
}