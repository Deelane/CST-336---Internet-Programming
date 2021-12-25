const express = require('express');
const mysql = require('mysql');
const fetch = require("node-fetch");
const pool = require("./dbPool.js");

const app = express();
 
const apiKey = "wYHCUEL4XRFt8gCj6uAvn-KTWGWlvixsutMEueRasBE";

app.set("view engine", "ejs");
app.use(express.static("public"));
 

//Landing Page
app.get("/", async function(req, res)
{
  try
  {
    let url = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&featured=true`;
    let response = await fetch(url);
    let data = await response.json();
    res.render("index.ejs", {"imageUrl": data.urls.small});
  }
  catch (error)
  {
    console.log(error);
  }
});


//Search
app.get("/search", async function(req, res) 
{
  try
  {
    let keyword = "";
    if (req.query.keyword)
    {
      keyword = req.query.keyword;
    }
    let url = `https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=9&featured=true&orientation=landscape&query=${keyword}`;
    let response = await fetch(url);
    let data = await response.json();
    let imageUrlArray = [];

    if (data.length > 0)
    {
      data.forEach(imageUrl => imageUrlArray.push(imageUrl.urls.small));
    }

    res.render("search.ejs", {"imageUrl": imageUrlArray[0], "imageUrlArray": imageUrlArray, "imageKeyword": keyword})
  }
  catch(error)
  {
    console.log(error);
  }
});

//update favorites
app.get("/api/updateFavorites", async(req, res) => {
 let sql;
 let sqlParams;
 switch (req.query.action) {
   case "add": sql = "INSERT INTO favorites (imageUrl, keyword) VALUES (?,?)";
               sqlParams = [req.query.imageUrl, req.query.keyword];
               break;
   case "delete": sql = "DELETE FROM favorites WHERE imageUrl = ?";
               sqlParams = [req.query.imageUrl];
               break;
 }//switch
 let rows = await executeSQL(sql, sqlParams);
 console.log(rows);
 res.send(rows.affectedRows.toString());   
});//api/updateFavorites
 
 //get keywords
app.get("/getKeywords",  async(req, res) => {
  let sql = "SELECT DISTINCT keyword FROM favorites ORDER BY keyword";
  let imageUrl = ["img/favorite.png"];
  let rows = await executeSQL(sql);
  console.log(rows);
  res.render("favorites", {"imageUrl": imageUrl, "rows":rows});  
});//getKeywords

//get favorites
app.get("/api/getFavorites", function(req, res){
  let sql = "SELECT imageURL FROM favorites WHERE keyword = ?";
  let sqlParams = [req.query.keyword];  
  pool.query(sql, sqlParams, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
  });
    
});//api/getFavorites



//functions
async function executeSQL(sql, params){
 return new Promise (function (resolve, reject) {
   pool.query(sql, params, function (err, rows, fields) {
     if (err) throw err;
     resolve(rows);
   });
 });
}

//start server
app.listen(3000, () => {
 console.log("Express server running...")
} )
