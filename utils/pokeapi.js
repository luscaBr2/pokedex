// Script destinado a recolher as informações da API do pokemon

const pokemonImage = document.getElementById("pokemon-image");
const pokemonName = document.getElementById("pokemon-name");
const pokemonID = document.getElementById("pokemon-id");
const mainContainer = document.querySelector(".container-pokemon");
let pokemons = []; // destinado a guardar todos os pokemons

// busca um pokemon pela url
async function fetchPokemonByURL(url) {
  const APIResponse = await fetch(url);

  // se a resposta da API for 200, retorna os dados
  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    return data;
  }
}

/// busca um pokemon pelo nome ou id
async function fetchPokemon(pokemon) {
  const APIResponse = await fetch(
    "https://pokeapi.co/api/v2/pokemon/" + pokemon
  );

  // se a resposta da API for 200, retorna os dados
  // 200 é o status de OK
  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    console.log("entrou no fetchPokemon");
    console.log(data);

    return data;
  }
}

let teste;

async function fetchAllPokemons() {
  try {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151&offset=0`);
    if (!APIResponse.ok) throw new Error(`HTTP error! status: ${APIResponse.status}`);
    
    const data = await APIResponse.json();
    return await Promise.all(data.results.map(pokemon => fetchPokemonByURL(pokemon.url)));
  } catch (error) {
    alert("Falha ao carregar Pokémons:", error);
    return []; // Retorna array vazio em caso de erro
  }
}

// renderiza os pokemons na tela, usando array global com as informações de pokemons
function renderPokemon(pokemons) {
  // limpa o container de pokemons
  mainContainer.innerHTML = "";

  pokemons.forEach((pokemon) => {
    let imgPokemon =
      pokemon["sprites"]["versions"]["generation-v"]["black-white"]["animated"][
        "front_default"
      ];
    let namePokemon = pokemon["name"];
    let idPokemon = pokemon["id"];

    // adicionar cards com os dados dos pokemons
    mainContainer.innerHTML += `<div class="pokemon-card"> <img id="pokemon-image" src="${imgPokemon}"> <h3> <span id="pokemon-id">${idPokemon}</span> - <span id="pokemon-name">${namePokemon}</span> </h3> </div>`;
  });
}

async function main() {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Aguarda a resolução da Promise
      pokemons = await fetchAllPokemons();
      
      if (pokemons.length > 0) {
        renderPokemon(pokemons);
      } else {
        alert("Nenhum Pokémon encontrado.");
      }
    } catch (error) {
      alert("Erro ao carregar Pokémons:", error);
    }
  });
}

main();
