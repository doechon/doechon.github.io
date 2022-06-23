<script>
	import Header from "./Skeleton/Header.svelte";
	import AboutMe from "./Skeleton/Main/AboutMe.svelte";
import MyProjects from './Skeleton/Main/MyProjects.svelte';
import ContactMe from './Skeleton/Main/ContactMe.svelte';
import Quote from './Skeleton/Main/Quote.svelte';
import Fotter from "./Skeleton/Fotter.svelte";
</script>
<main>
	<Header/>
	<div class="main">
		<AboutMe/>
		<MyProjects/>
		<ContactMe/>
		<Quote/>
	</div>
	<Fotter/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>