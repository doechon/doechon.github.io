<script>
	import Header from "./Skeleton/Header.svelte";
	import AboutMe from "./Skeleton/Main/AboutMe.svelte";
import MyProjects from './Skeleton/Main/MyProjects.svelte';
import ContactMe from './Skeleton/Main/ContactMe.svelte';
import Quote from './Skeleton/Main/Quote.svelte';
import Fotter from "./Skeleton/Fotter.svelte";
import Style from "./Style.svelte";
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
