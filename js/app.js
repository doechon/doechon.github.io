$.getJSON("https://favqs.com/api/qotd", function (data) {
  let author = document.querySelector(".quote__author");
  let quote = document.querySelector(".quote__body");
  author.textContent = data.quote.author;
  quote.textContent = data.quote.body;
});
