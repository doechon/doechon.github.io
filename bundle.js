$.getJSON("https://random.dog/woof.json",(function(o){document.querySelector(".dog__image").src=o.url}));
