$(document).ready(async function()
{
    //apply form classes
    $("input").each(function()
    {
      let input = $(this);
      if (input.attr("type") == "text" || input.attr("type") == "password")
      {
        input.attr("class", "form-control");
      }
      else if(input.attr("type") == "submit")
      {
        input.attr("class", "btn btn-lg btn-primary btn-block");
        input.css("width", "100%");
      }
    });

    $("p").each(function()
    {
        let p = $(this);
        p.css("font-weight", "bold");
    });
    
    var usernameAvailable = false;
    
    //populate state select
    let response = await fetch("https://cst336.herokuapp.com/projects/api/state_abbrAPI.php");
    let data = await response.json();
    console.log(data);
    data.forEach(stateObject => $("#state").append(`<option value="${stateObject.usps}">${stateObject.state}</option>`));

    $("#zip").on("change", async function()
    {
      let zipCode = $("#zip").val();
      let url = `https://itcdland.csumb.edu/~milara/ajax/cityInfoByZip.php?zip=${zipCode}`;
      let response = await fetch(url);
      let data = await response.json();
      //console.log(data);
      if (data)
      {
        $("#zipCodeError").html("");
        $("#city").html(data.city);
        $("#latitude").html(data.latitude);
        $("#longitude").html(data.longitude);
      }
      else
      {
        $("#zipCodeError").html("Zip code not found!");
        $("#zipCodeError").css("color", "red");
      }
    });

    $("#state").on("change", async function()
    {
      let state = $("#state").val();
      let url = `https://itcdland.csumb.edu/~milara/ajax/countyList.php?state=${state}`;
      let response = await fetch(url);
      let data = await response.json();
      //console.log(data);
      if (data)
      {
        $("#countyDiv").show();
        $("#county").html("<option>Select one</option>");
        for (let i = 0, length = data.length; i < length; i++)
        {
          $("#county").append(`<option>${data[i].county}</option>`)
        }
      }
    });

    $("#username").on("change", async function()
    {
      let username = $("#username").val();
      let url = `https://cst336.herokuapp.com/projects/api/usernamesAPI.php?username=${username}`;
      let response = await fetch(url);
      let data = await response.json();

      if (data.available)
      {
        $("#usernameError").html("Username available!");
        $("#usernameError").css("color", "green");
        usernameAvailable = true;
      }
      else
      {
        $("#usernameError").html("Username not available.");
        $("#usernameError").css("color", "red");
      }
    });

    $("#signupForm").on("submit", function(e)
    {
      //alert("Submitting form...");
      if (!isFormValid())
      {
        e.preventDefault();
      }
    });

    function isFormValid()
    {
      $("#passwordError").html("");
      isValid = true;
      if (!usernameAvailable)
      {
        isValid = false;
      }
      if($("#username").val().length == 0)
      {
        isValid = false;
      }
      if($("#password").val() != $("#password2").val())
      {
        $("#passwordError").append("<p>Passwords do not match!</p>");
        isValid = false;
      }
      if ($("#password").length < 6)
      {
        $("#passwordError").append("<p>Password must of length 6 or more!</p>");
      }
      return isValid;
    }
});