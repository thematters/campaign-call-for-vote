<script>
  import '../app.pcss';
</script>

<svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
  <rect
    width="100%"
    height="100"
    stroke="transparent"
    stroke-width="1"
    fill="#38288b"
    fill-opacity="1"
  />
  <path
    d="M720 40.3057C1017.18 40.3057 1280.06 55.9805 1440 80V0H0V80C159.936 55.974 422.82 40.3057 720 40.3057Z"
    fill="#FFA599"
  />
</svg>

<div class="app">
  <main>
    <slot />
  </main>

  <footer>
    © 2024 Matters, Inc. All rights reserved. <a
      href="https://Matters.Town"
      target="_blank"
      rel="noreferrer">Matters.Town</a
    >
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    color: white;
    background-color: #38288b;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 30rem;
    margin: 0 auto;
    box-sizing: border-box;
    text-align: center;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
    color: #9584ec;
  }

  footer a {
    font-weight: bold;
    color: white;
  }

  @media (min-width: 680px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
