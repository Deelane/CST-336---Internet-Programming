/**Packages**/
const express = require("express");
const axios = require("axios");//for use with yelp API
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

/**Database**/
const pool = require("./dbPool.js"); //database connection pool

/**Email**/
const emailUser = require("./config/emailCreds")["email"].user;
const emailPass = require("./config/emailCreds")["email"].password;

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth:
            {
                user: emailUser,
                pass: emailPass
            }
    });

/**Activities**/
const activitiesMap = new Map();
activitiesMap.set("active, All", "Active Life");
activitiesMap.set("arts, All", "Arts & Entertainment");
activitiesMap.set("beautysvc, All", "Beauty & Spas");
activitiesMap.set("food, All", "Food");
activitiesMap.set("hotelstravel, All", "Hotels & Travel");
activitiesMap.set("nightlife, All", "Nightlife");


/**APP Settings**/
const app = express();

//Allows use of ejs templating
app.set("view engine", "ejs");


//Allows parsing of POST parameters
app.use(express.urlencoded({extended: true}));

//Specifies folder for static files (images, css, etc)
app.use(express.static("public"));

/**ROUTES**/
//Landing Page
app.get("/", async (req, res) =>
{
    res.render("index.ejs");
});

//Destinations
app.get("/destinations", async (req, res) =>
{
    /**RANDOM DESTINATIONS**/
    //Make the database call here for 50 random destinations for the user to play with
    let sql = "select address_string from location_tbl ORDER BY RAND () LIMIT 50;";
    let params = [1];
    let rows = await executeSQL(sql, params);
    let randomDestinationArray = [];
    rows.forEach(result =>
    {
        randomDestinationArray.push(result.address_string);
    });
    let options =
        {
            randomDestinationArray: randomDestinationArray
        };
    res.render("destinations.ejs", {"options": options});
});

//Take Trips
app.get("/api/planTrip", async (req, res) =>
{
    res.send(req.query.tripId);
});

//Recent Trips
app.get("/recent", async (req, res) =>
{
    let sql = "select * from recenttrips_vw order by times_taken desc limit 10 ;";
    let params = [1];
    let rows = await executeSQL(sql, params);
    res.render("recenttrips.ejs", {"recentTripsArray":rows});
});

//Finalize Trip
app.post("/finalizeTrip", async (req, res) =>
{
    //Location data from POST request
    let userCoordinates = req.body.userCoordinates;
    let departure = req.body.departure;
    let destination = req.body.destination;
    let preferredActivities = req.body.preferredActivities;

    if (userCoordinates === "" || userCoordinates === undefined || userCoordinates === null)
    {
        let key = require("./config/APIkeys.js")["positionStack"].key;
        let url = "https://api.positionstack.com/v1/forward?access_key=" + key + "&query=" + departure;
        await fetch(url)
            .then(response => response.json())
            .then(data =>
            {
                userCoordinates = `${data.data[0].latitude}, ${data.data[0].longitude}`;
            }) //For some reason they append "data" to the start of their JSON results
            .catch(e =>
            {
                console.log(e);
            });
    }

    //grab yelp key
    let key = require("./config/APIkeys.js")["yelp"].key;

    //build API Call
    let apiCall = axios.create({
        baseURL: "https://api.yelp.com/v3/",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-type": "application/json",
        },
    });

    //Query results
    var yelpResults = "";

    try
    {
        //query yelp API
        await apiCall("/businesses/search", {
            params:
                {
                    location: destination,
                    categories: preferredActivities,
                    limit: 10
                }
        }).then(({ data }) =>
        {
            yelpResults = data;
        });
    }
    catch (error)
    {
        console.log(error);
    }

    //Show error page for bad request
    if (typeof(yelpResults) == "undefined" || yelpResults == null || yelpResults === "")
    {
        res.render("errorpage.ejs", {"errorMessage": "Please try specifying or changing your destination."});
    }
    else
    {
        //options for templating
        let options =
            {
                "userCoordinates": userCoordinates,
                "departure": departure,
                "destination": destination,
                "preferredActivities": activitiesMap.get(preferredActivities),
                "yelpResults": yelpResults
            };
        res.render("finalizetrip.ejs", {"options": options});
    }
});

//Confirm trip
app.post("/confirmTrip", async (req, res) =>
{
    let userCoordinates = req.body.userCoordinates.split(", "); //this one is a string
    let departure = req.body.departure;
    let destination = req.body.destination;
    let destinationCoordinates = [];
    let email = req.body.email;

    //grab positionstack key
    let key = require("./config/APIkeys.js")["positionStack"].key;
    //departure coordinates reverse geocode
    let url = "https://api.positionstack.com/v1/forward?access_key=" + key + "&query=" + destination;
    try
    {
        await fetch(url)
            .then(response => response.json())
            .then(data =>
            {
                destinationCoordinates.push(data.data[0].latitude, data.data[0].longitude);
            }) //For some reason they append "data" to the start of their JSON results
            .catch(e =>
            {
                console.log(e);
            });

    }
    catch (error)
    {
        console.log(error);
    }

    /**DATABASE INSERTION**/
    //INSERT LOCATION DATA, CHECK IF EXISTS
    sql = "call insert_location(?);";
    let dept_id = await executeSQL(sql, [departure]);
    dept_id = dept_id[0][0].id;

    sql = "call insert_location(?);";
    let dest_id = await executeSQL(sql, [destination]);
    dest_id = dest_id[0][0].id;

    //INSERT TRIP DATA, INCREMENT TIMES TAKEN IF EXISTS
    sql = "call insert_trip(?, ?);";
    let trip_id = await executeSQL(sql, [dept_id, dest_id]);
    trip_id = trip_id[0][0].trip_id;

    //store added activities

    let activities = [];

    //10 items for now
    for (let i = 0; i < 10; i++)
    {
        let checkbox = req.body["checkbox" + i];
        if (checkbox === "on")
        {
            let activity =
                {
                    id: req.body["activity" + i],
                    name: req.body["activityName" + i],
                    url: req.body["activityUrl" + i],
                    location: req.body["activityLocation" + i],
                    phone: req.body["activityPhone" + i],
                    image_url: req.body["activityImg" + i]
                };

            activities.push(activity);

            //INSERT ACTIVITY DATA FROM TRIP
            sql = "call insert_activity(?, ?, ?, ?, ?, ?);";
            let result = await executeSQL(sql, [trip_id, activity.name, activity.url, activity.location, activity.phone, JSON.stringify(activity)]);
        }
    }
    //DATABASE UPDATE END

    /**EMAIL USER**/
    if (email !== "")
    {
        let activitiesHTML = "";
        activities.forEach(activity =>
        {
           activitiesHTML +=
               `
                    <hr>
                    <br>
                    <div>
                        <div style="display: inline">
                            <a href="${activity.url}">${activity.name}</a>
                            <p>${activity.location}</p>
                            <p>${activity.phone}</p>
                        </div>
                        <div style="display: inline">
                            <img style="width: 150px; height: 150px;" src="${activity.image_url}" alt="image of ${activity.name}">
                        </div>
                    </div>
                    <br>
               `;

        });
        let messageHTML =
            `
                <h1>Thank you for using Trip Planner!</h1>
                <br>
                <h2>Trip Details:</h2>
                <br>
                <b>Departure:</b> ${departure}
                <br>
                <b>Destination:</b> ${destination}
                <br><br>
                <b>Activities:</b>
                <br><br>
                ${activitiesHTML}
                <hr>
            `;
        // send mail with defined transport object
        let mailOptions =
            {
                from: `"Trip Planner" <cst336final@gmail.com>`, // sender address
                to: email, // list of receivers
                subject: "Trip Confirmed", // Subject line
                text: "Thank you for using Trip Planner.", // plain text body
                html: messageHTML, // html body
            };

        transporter.sendMail(mailOptions, function(error, info)
        {
            if (error)
            {
                console.log(error)
            }
            else
            {
                console.log(`Email confirmation sent to ${email}\nInfo: ${info.response}`);
            }
        });
    }

    /**NO ACTIVITIES SELECTED**/
    //Display 3 popular activities if none were selected
    let hasActivities = activities.length !== 0;
    if (!hasActivities)
    {
        for (let i = 0; i < 3; i++)
        {
            let activity =
                {
                    id: req.body["activity" + i],
                    name: req.body["activityName" + i],
                    url: req.body["activityUrl" + i],
                    location: req.body["activityLocation" + i],
                    phone: req.body["activityPhone" + i],
                    image_url: req.body["activityImg" + i]
                };
            activities.push(activity);
        }
    }

    let options =
        {
            "userCoordinates": userCoordinates,
            "departure": departure,
            "destination": destination,
            "destinationCoordinates": destinationCoordinates,
            "activities": activities,
            "hasActivities": hasActivities
        };
    res.render("confirmtrip.ejs", {"options": options});
});

/**SERVER START**/
app.listen(3000, () => console.log("Server started"));

/**FUNCTIONS**/
async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if(err) throw err;
      resolve(rows);
    });
  });
}
