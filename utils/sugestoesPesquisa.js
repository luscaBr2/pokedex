// Script destinado a funcionalidade de sugestões de pesquisa
// Ao usuário digitar algo na barra de pesquisa, serão sugeridos alguns itens que contem o que foi digitado
const searchInput = document.getElementById("pesquisa");
const suggestionsBox = document.getElementById("sugestoes-pesquisa");

const suggestions = [
  "Abacaxi",
  "Banana",
  "Cereja",
  "Damasco",
  "Estrela",
  "Foguete",
  "Gato",
  "Girassol",
  "Helicóptero",
  "Igreja",
];

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  suggestionsBox.innerHTML = ""; // limpa o que tiver dentro da div

  if (query.length >= 1) {
    const buscaFiltrada = suggestions.filter((item) =>
      item.toLowerCase().includes(query)
    );

    if (buscaFiltrada.length > 0) {
      buscaFiltrada.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("sugestao");
        div.textContent = item;
        div.addEventListener("click", () => {
          searchInput.value = item;
          suggestionsBox.classList.add("hidden");
          searchInput.classList.remove("tem-sugestao");
        });
        suggestionsBox.appendChild(div);
      });
      suggestionsBox.classList.remove("hidden");
      searchInput.classList.add("tem-sugestao");
    } else {
      // se não houver sugestões, esconde a div e remove a classe tem-sugestao
      suggestionsBox.classList.add("hidden");
      searchInput.classList.remove("tem-sugestao");
    }
  } else {
    suggestionsBox.classList.add("hidden");
    searchInput.classList.remove("tem-sugestao");
  }
});

document.addEventListener("click", (e) => {
  if (!document.querySelector(".search-container").contains(e.target)) {
    suggestionsBox.classList.add("hidden");
    searchInput.classList.remove("tem-sugestao");
  }
});
