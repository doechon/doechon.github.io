$.getJSON("https://random.dog/woof.json", function (data) {
  let dogImage = document.querySelector(".dog__image");
  dogImage.src = data.url;
});
