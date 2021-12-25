$(document).ready(function(){
  console.log("working");
  //Give question containers form control class
  $("article>div").each(function()
  {
    if ($(this).attr("id") == null)
    {
      $(this).attr("class", "form-control flex-down");
    }
  });

  $("select").attr("class", "form-control");

  var score = 0;
  //Will assign a value of 0 if item doesn't exist in local storage
  var attempts = localStorage.getItem("total_attempts");

  $("button").on("click", gradeQuiz);

  displayQ4Choices();
  displayQ8Choices();

  function displayQ4Choices()
  {
    let q4ChoicesArray = ["Maine", "Rhode Island", "Maryland", "Delaware"];
    q4ChoicesArray = _.shuffle(q4ChoicesArray);

    for (let i = 0, length=q4ChoicesArray.length; i < length; i++)
    {
      $("#q4Choices").append(`<div><input type="radio" name="q4" id="${q4ChoicesArray[i]}" value="${q4ChoicesArray[i]}"> <label for="${q4ChoicesArray[i]}"> ${q4ChoicesArray[i]}</label></div>`);
    }
  }

  function displayQ8Choices()
  {
    let q8ChoicesArray = ["California", "Texas", "Florida", "New York"];
    q8ChoicesArray = _.shuffle(q8ChoicesArray);

    for (let i = 0, length=q8ChoicesArray.length; i < length; i++)
    {
      $("#q8Choices").append(`<div><input type="radio" name="q8" id="${q8ChoicesArray[i]}" value="${q8ChoicesArray[i]}"> <label for="${q8ChoicesArray[i]}"> ${q8ChoicesArray[i]}</label></div>`);
    }
  }

  //Ensure question was answered
  function isFormValid()
  {
    let isValid = true;
    if($("#q1").val() == "")
    {
      isValid = false;
      $("#validationFdbk").html("Question 1 was not answered");
    }
    return isValid;
  }
  
  function rightAnswer(index)
  {
    $(`#q${index}Feedback`).html("Correct!");
    $(`#q${index}Feedback`).attr("class", "bg-success text-white");
    $(`#markImg${index}`).html("<img src=`img/checkmark.png`>");
    score += 10;
  }

  function wrongAnswer(index)
  {
    $(`#q${index}Feedback`).html("Incorrect!");
    $(`#q${index}Feedback`).attr("class", "bg-warning text-white");
    $(`#markImg${index}`).html("<img src=`img/xmark.png`>");
  }

  function gradeQuiz()
  {
    //reset validationFdbk
    $("#validationFdbk").html("");
    if (!isFormValid())
    {
      return;
    }

    score = 0;

    let q1Response = $("#q1").val().toLowerCase();
    let q2Response = $("#q2").val();
    let q4Response = $("input[name=q4]:checked").val();
    let q5Response = $("#q5").val().toLowerCase();
    let q6Response = $("#q6").val();
    let q8Response = $("input[name=q8]:checked").val();
    let q9Response = $("#q9").val().toLowerCase();
    let q10Response = $("#q10").val();
    //Question 1
    if (q1Response == "sacramento")
    {
      rightAnswer(1);
    }
    else
    {
      wrongAnswer(1);
    }
          
    //Question 2
    if (q2Response == "mo")
    {
      rightAnswer(2);
    }
    else
    {
      wrongAnswer(2);
    }

    //Question 3
    if ($("#Jefferson").is(":checked") && $("#Roosevelt").is(":checked") && !$("#Michigan").is(":checked") && !$("#Florida").is(":checked"))
    {
      rightAnswer(3);
    }
    else
    {
      wrongAnswer(3);
    }

    //Question 4
    if (q4Response == "Rhode Island")
    {
      rightAnswer(4);
    }
    else
    {
      wrongAnswer(4);
    }

    //Question 5
    if (q5Response == "colorado")
    {
      rightAnswer(5);
    }
    else
    {
      wrongAnswer(5);
    }

    //Question 6
    if (q6Response == "ak")
    {
      rightAnswer(6);
    }
    else
    {
      wrongAnswer(6);
    }

    //Question 7
    if ($("#NewYork").is(":checked") && $("#Pennsylvania").is(":checked") && !$("#Jackson").is(":checked") && !$("#Franklin").is(":checked"))
    {
      rightAnswer(7);
    }
    else
    {
      wrongAnswer(7);
    }

    //Question 8
    if (q8Response == "California")
    {
      rightAnswer(8);
    }
    else
    {
      wrongAnswer(8);
    }

    //Question 9
    if (q9Response == "texas")
    {
      rightAnswer(9);
    }
    else
    {
      wrongAnswer(9);
    }
          
    //Question 10
    if (q10Response == "me")
    {
      rightAnswer(10);
    }
    else
    {
      wrongAnswer(10);
    }

    //Score is red if under 80, green otherwise
    if (score < 80)
    {
      $("#totalScore").attr("class", "bg-danger");
    }
    else
    {
      alert("Congratulations, your score is above 80");
      $("#totalScore").attr("class", "bg-success");
    }

    $("#totalScore").html(`Total score: ${score}`);
    $("#totalAttempts").html(`Total attempts: ${++attempts}`);
    localStorage.setItem("total_attempts", attempts);
  }

});
