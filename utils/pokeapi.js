// Script destinado a recolher as informações da API do pokemon

const pokemonImage = document.getElementById("pokemon-image");
const pokemonName = document.getElementById("pokemon-name");
const pokemonID = document.getElementById("pokemon-id");
const mainContainer = document.querySelector(".container-pokemon");
const mensagemInterna = document.getElementById("mensagem-interna");
const imgLoading = document.getElementById("loading");
const imgErro = document.getElementById("erro");

let pilhaErros = []; // destinado a empilhar os erros para serem exibidos de acordo com a ordem de chegada

let pokemons = []; // destinado a guardar todos os pokemons

function editarMensagemInterna(mensagem) {
  mensagemInterna.innerHTML = mensagem;
}

function mostrarLoading() {
  imgLoading.classList.remove("hidden");
}

function esconderLoading() {
  imgLoading.classList.add("hidden");
}

function mostrarErro() {
  imgErro.classList.remove("hidden");
}

function esconderErro() {
  imgErro.classList.add("hidden");
}

async function requisitarAPI(linkRequisicao) {
  try {
    mostrarLoading();
    editarMensagemInterna("Conectando com a API...");

    const APIResponse = await fetch(linkRequisicao);

    // se a resposta da API não for 200, retorna erro
    if (!APIResponse.ok)
      throw new Error("Erro na requisição da API: " + APIResponse.status);
    
    editarMensagemInterna("Conectado com a API :) <br> Buscando pokemons...");

    const data = await APIResponse.json();

    return data;
  } catch (error) {
    mostrarErro();
    esconderLoading();
    editarMensagemInterna("Falha ao fazer a requisição. Erro: " + error);
    pilhaErros.push("Falha ao fazer a requisição. Erro: " + error);

    return null;
  }
}

// busca um pokemon pela url
async function fetchPokemonByURL(url) {
  try {
    const data = requisitarAPI(url);
    return data;

  } catch (error) {
    mostrarErro();
    esconderLoading();
    editarMensagemInterna("Falha ao buscar o pokemon pela URL. Erro: " + error);
    pilhaErros.push("Falha ao buscar o pokemon pela URL. Erro: " + error);

    return null;
  }
}

/// busca um pokemon pelo nome ou id
async function fetchPokemon(pokemon) {
  try {

    const data = requisitarAPI("https://pokeapi.co/api/v2/pokemon/" + pokemon);
    return data;

  } catch (error) {
    mostrarErro();
    esconderLoading();
    editarMensagemInterna("Falha ao buscar o pokemon. Erro: " + error);

    return null;
  }
}

async function fetchAllPokemons() {
  try {

    const data = await requisitarAPI(
      `https://pokeapi.co/api/v2/pokemon?limit=151&offset=0`
    );

    // pega todas as promisses e retorna um array com os resultados individualmente de cada pokemon e atribui ao array global pokemons
    return await Promise.all(
      data.results.map((pokemon) => fetchPokemonByURL(pokemon.url))
    );

  } catch (error) {
    mostrarErro();
    esconderLoading();
    editarMensagemInterna("Falha ao buscar todos os pokemons. Erro: " + error);
    pilhaErros.push("Falha ao buscar todos os pokemons. Erro: " + error);

    return []; // Retorna array vazio em caso de erro
  }
}

// renderiza os pokemons na tela, usando array global com as informações de pokemons
function renderPokemon(pokemons) {
  try {
    // limpa o container de pokemons
    mainContainer.innerHTML = "";

    pokemons.forEach((pokemon) => {
      let imgPokemon =
        pokemon["sprites"]["versions"]["generation-v"]["black-white"][
          "animated"
        ]["front_default"];
      let namePokemon = pokemon["name"];
      let idPokemon = pokemon["id"];

      // adicionar cards com os dados dos pokemons
      mainContainer.innerHTML += `<div class="pokemon-card"> <img id="pokemon-image" src="${imgPokemon}"> <h3> <span id="pokemon-id">${idPokemon}</span> - <span id="pokemon-name">${namePokemon}</span> </h3> </div>`;
    });
  } catch (error) {
    mostrarErro();
    esconderLoading();
    editarMensagemInterna("Falha ao renderizar os pokemons. Erro: " + error);
    pilhaErros.push("Falha ao renderizar os pokemons. Erro: " + error);
  }
}

async function main() {
  document.addEventListener("DOMContentLoaded", async () => {
    try {

      // Aguarda a resolução das Promises e retorna um array
      pokemons = await fetchAllPokemons();

      if (pokemons.length > 0) {
        renderPokemon(pokemons);
      } else {
        throw new Error("Nenhum pokemon encontrado.");
      }

      atualizarSugestoes(pokemons); // função presente no arquivo utils\sugestoesPesquisa.js

    } catch (error) {
      mostrarErro();
      esconderLoading();

      // dentro da main, não edita o mensagem interna pois todos os erros ja serão exibidos na tela

      pilhaErros.push("Falha ao carregar os pokemons. " + error);

      // mostra todos os erros que ocorreram na execução do programa
      if (pilhaErros.length > 0) {
        editarMensagemInterna(pilhaErros.join("<br>"));
      }
    }
  });
}

main();
