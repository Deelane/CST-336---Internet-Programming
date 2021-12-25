const express = require("express");
const faker = require("faker");

const app = express();

app.set("view engine", "ejs");

//specifies folder for static files (images, css, etc)
app.use(express.static("public"));

//Landing Page
app.get("/", async (req, res) =>
{
	try
	{
		let selected = "index";
		res.render("index.ejs", {"selected": selected});
	}
	catch (error)
	{
		console.log(error);
	}
});

//Resources
app.get("/resources", async (req, res) =>
{
	try
	{
		let selected = "resources";
		res.render("resources.ejs", {"selected": selected});
	}
	catch (error)
	{
		console.log(error);
	}
});

//Community
app.get("/community", async (req, res) =>
{
	try
	{
		let selected = "community";
		res.render("community.ejs", {"selected": selected});
	}
	catch (error)
	{
		console.log(error);
	}
});

//Examples
app.get("/examples", async (req, res) =>
{
	try
	{
		let selected = "examples";
		res.render("examples.ejs", {"selected": selected});
	}
	catch (error)
	{
		console.log(error);
	}
});

//User of the day (Faker)
app.get("/user", async (req, res) =>
{
	try
	{
		let selected = "userOfTheDay";

		//Build random user object
		let userObject =
			{
				"avatar": faker.image.avatar(),
				"firstName": faker.name.firstName(),
				"lastName": faker.name.lastName(),
				"jobTitle": faker.name.jobTitle(),
				"company": faker.company.companyName(),
				"address": {
					"streetAddress": faker.address.streetAddress(),
					"streetName": faker.address.streetName(),
					"city": faker.address.city(),
					"state": faker.address.state(),
					"zipCode": faker.address.zipCodeByState(this.state)
				},
			};
		res.render("user.ejs", {"selected": selected, "userObject": userObject});
	}
	catch (error)
	{
		console.log(error);
	}
});

app.listen(3000, () => console.log("Server started"));