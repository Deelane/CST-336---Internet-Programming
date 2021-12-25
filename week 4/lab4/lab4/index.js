const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.set("view engine", "ejs");

//specifies folder for static files (images, css, etc)
app.use(express.static("public"));

/**LOAD ALL NECESSARY API DATA ON SERVER START ONCE ONLY**/

//planets array, this can be expanded to include any known body
var planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
//array for holding body objects
var bodies = [];

//Load data
loadDataFromAPI();

//Load paths to planet pages
loadPaths();

async function loadDataFromAPI()
{
	//Attempt to retrieve data
	try
	{
		//load all planetary bodies
		let url = "https://api.le-systeme-solaire.net/rest/bodies/";
		let response = await fetch(url);
		let data = await response.json();
				
		//loop over each body
		data.bodies.forEach(celestialBody =>
		{
			//Get data only for our planets
			planets.forEach(planet => 
			{
				if (celestialBody.englishName.toLowerCase() == planet.toLowerCase())
				{		
					/**NULL CHECKING**/
					let id = celestialBody.id == null ? "" : celestialBody.id;
					let frenchName = celestialBody.name == null ? "" : celestialBody.name;
					let englishName = celestialBody.englishName == null ? "" : celestialBody.englishName;
					let mass = celestialBody.mass == null ? "" : celestialBody.mass;
					let volume = celestialBody.vol == null ? "" : celestialBody.vol;
					let density = celestialBody.density == null ? "" : celestialBody.density;
					let gravity = celestialBody.gravity == null ? "" : celestialBody.gravity;
					let avgRadius = celestialBody.meanRadius == null ? "" : celestialBody.meanRadius;
					let refOrbit = celestialBody.aroundPlanet == null ? "" : celestialBody.aroundPlanet;
					let discoveredBy = celestialBody.discoveredBy == null ? "" : celestialBody.discoveredBy;
					let discoveryDate = celestialBody.discoveryDate == null ? "" : celestialBody.discoveryDate;
					let axialTilt = celestialBody.axialTilt == null ? "" : celestialBody.axialTilt;
					let avgTemp = celestialBody.avgTemp == null ? "" : celestialBody.avgTemp;
					
					//create new body object and add to array
					bodies.push(
					{
						id: id, 
						frenchName: frenchName,
						englishName: englishName,
						mass: mass,
						volume: volume,
						density: density,
						gravity: gravity,
						avgRadius: avgRadius,
						refOrbit: refOrbit,
						discoveredBy: discoveredBy,
						discoveryDate: discoveryDate,
						axialTilt: axialTilt,
						avgTemp: avgTemp
					});
				}
			});
		});
	}
	catch (e)
	{
		console.log(e);
	}
}

//Load navbar with planet links
async function loadPaths()
{
	//Planet Pages
	//dynamically generate paths
	planets.forEach(planet =>
	{
		//dynamically construct path
		let planetName = planet.toLowerCase();
		let path = "/" + planetName;
		app.get(path, async (req, res) => 
		{
			try
			{
				//find body object for current planet
				let body;
				bodies.forEach(bodyObject =>
				{
					if (bodyObject.englishName.toLowerCase() === planetName)
					{
						body = bodyObject;
					}
				});
				path = planetName + ".ejs";
				res.render(path, {"planet": planet, "body":body});
			}
			catch (e)
			{
				console.log(e);
			}
		});
	});
}

//Landing Page
app.get("/", async (req, res) => 
{
	res.render("index.ejs", {"bodies":bodies, "planets":planets});
});

app.listen(3000, () => console.log("Server started"));