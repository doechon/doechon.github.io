<div class="about-me card bg-yellow">
    <h2 id="aboutme">About me</h2>
    <div class="about-me__description">
      <figure class="about-me__figure">
        <a href="#aboutme">
          
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <img
            src="img/myself.jpg"
            alt="photo of myself"
            class="about-me__img"
          />
        </a>
        <!-- svelte-ignore a11y-structure -->
        <figcaption class="about-me__figcaption">
          <h3>Ivan Chebykin</h3>
        </figcaption>
        <p>
          I love coding 👨‍💻, playing guitar 🎸 and speaking to people 🗣️. My
          stack of technologies: python, java, web (html, css, js).
        </p>
      </figure>
    </div>
</div>
<style>
  .card {
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 20px;
}
  .bg-yellow {
  background: #faffe5;
}
  .about-me__img {
  max-width: 200px;
  border-radius: 10%;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
}

</style>