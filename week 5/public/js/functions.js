$(document).ready(function() {
  
  /* When clicking on any favorite icon
      the icon swaps from empty to filled
      and image url is added/deleted to   the database*/
  $(".favoriteIcon").on("click",function()
  {
      //parse current url
      let queryString = window.location.search;
      //parse search parameters
      let urlParams = new URLSearchParams(queryString);
      let keyword = urlParams.get("keyword");
      let imageUrl = $(this).prev().attr("src");

      if ($(this).attr("src") == "/img/favorite.png") 
      {       
        $(this).attr("src","/img/favorite_on.png");
        updateFavorite("add", imageUrl, keyword);
      }
      else 
      {       
        $(this).attr("src","/img/favorite.png");
        updateFavorite("delete", imageUrl);
      }
  }); //favoriteIcon 
 
  async function updateFavorite(action, imageUrl, keyword)
  {
    let url = `/api/updateFavorites?action=${action}&imageUrl=${imageUrl}&keyword=${keyword}`;
    await fetch(url);
  }

  //keyword link
  $(".keywordLink").on("click", async function(){

      let keyword =  $(this).html().trim(); 
      $("#keywordSelected").val(keyword);
      let response = await  fetch(`/api/getFavorites?keyword=${keyword}`);
      let data = await response.json();
        
      $("#favorites").html("");
      let htmlString = "";

      for (let i = 0; i < data.length; i++) {
        htmlString += `<img class="image" src="${data[i].imageURL}" width="200" height="200">`;
      htmlString += "<img class='favoriteIcon' src='img/favorite_on.png' width='20'>";
    }

    $("#favorites").append(htmlString);
  
  });//keywordLink

  //Event for dynamic content generated when clicking on a keyword    
$("#favorites").on("click", ".favoriteIcon", function(){
            
 let favorite = $(this).prev().attr("src");
        
 if ($(this).attr("src") == 'img/favorite.png')
 {             
  $(this).attr("src","img/favorite_on.png");
  updateFavorite("add",favorite, $("#keywordSelected").val());
} 
else 
{               
   $(this).attr("src","img/favorite.png");
   updateFavorite("delete",favorite);
  }
});//.favoriteIcon event listener


});//document.ready
