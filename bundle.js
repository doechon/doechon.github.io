$.getJSON("https://favqs.com/api/qotd",(function(t){var e=document.querySelector(".quote__author"),o=document.querySelector(".quote__body");e.textContent=t.quote.author,o.textContent=t.quote.body}));
