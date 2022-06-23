<!-- fetch("https://favqs.com/api/qotd"); -->

<!-- <div class="quote card bg-red">
    <div class="quote__author">{data}</div>
    <div class="quote__body"></div>
  </div> -->

<script>
  import { onMount } from "svelte";
  import { writable, derived } from 'svelte/store';

/** Store for your data. 
This assumes the data you're pulling back will be an array.
If it's going to be an object, default this to an empty object.
**/
export const apiData = writable([]);

/** Data transformation.
For our use case, we only care about the drink names, not the other information.
Here, we'll create a derived store to hold the drink names.
**/
export const drinkNames = derived(apiData, ($apiData) => {
  if ($apiData.drinks){
    return $apiData.drinks.map(drink => drink.strDrink);
  }
  return [];
});
  onMount(async () => {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then(response => response.json())
    .then(data => {
      console.log(data);
      apiData.set(data);
    }).catch(error => {
      console.log(error);
      return [];
    });
  });
  </script>
  
  <main>
    <h1>Just name of random cocktail</h1>
    <ul>
    {#each $drinkNames as drinkName}
      <li>{drinkName}</li>
    {/each}
    </ul>
  </main>
  
  <style>
  
  </style>
