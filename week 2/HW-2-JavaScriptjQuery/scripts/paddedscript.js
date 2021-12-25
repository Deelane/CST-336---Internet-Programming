$(document).ready(function()
{
    let barsArray = [];
    let realBarsArray = [];

    //Load both text files
    //Load file as response
    fetch("txt/bars.txt")
        //convert response to text
        .then(response => response.text()
            //convert text to string
            .then(function(string)
            {
                //split string by newline and store in array
                barsArray = string.split("\n");
            }));
    fetch("txt/realbars.txt")
        .then(response => response.text()
            .then(function(string)
            {
                realBarsArray = string.split("\n");
            }));

    //since there's only one button
    $("button").on("click", function()
    {
        //reset ipsumtext
        $("#ipsumtext").html("");
        let barsPerParagraph = 5;
        let numParagraphs = $("#paragraphs").val();
        let output = "";
        //Add FORTY to output
        if ($("#fortycheckbox").is(":checked"))
        {
            output = "FORTY ";
        }
        //Combine non vulgar and vulgar arrays
        if ($("#realcheckbox").is(":checked"))
        {
            let length = realBarsArray.length;
            for (let i = 0; i < length; i++)
            {
                let bar = realBarsArray[i];
                barsArray.push(bar);
            }
        }

        //Shuffle bars
        barsArray = _.shuffle(barsArray);
        let barsArrayIndex = 0;
        //5 bars per paragraph for now
        for (let i = 0; i < numParagraphs; i++)
        {
            for (let j = 0; j < barsPerParagraph; j++)
            {
                output += barsArray[barsArrayIndex];
                barsArrayIndex++;
            }
            output += "<br><br>";
        }
        $("#ipsumtext").append(output);
        $("#e40glasses").show();
    });
});