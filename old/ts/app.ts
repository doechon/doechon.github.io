$.getJSON("https://favqs.com/api/qotd", function (data) {
  let author = document.querySelector(".quote__author") as HTMLElement;
  let quote = document.querySelector(".quote__body") as HTMLElement;
  author.textContent = data.quote.author;
  quote.textContent = data.quote.body;
});
