// Script destinado a recolher as informações da API do pokemon

const pokemonImage = document.getElementById("pokemon-image");
const pokemonName = document.getElementById("pokemon-name");
const pokemonID = document.getElementById("pokemon-id");
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

// busca todos os pokemons de uma vez
async function fetchAllPokemons() {
  const APIResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`
  );

  if (APIResponse.status === 200) {
    const data = await APIResponse.json();

    // coloca na var pokemons todos os pokemons
    data.results.forEach((pokemon) => {
      const pokemonData = fetchPokemonByURL(pokemon.url);
      
      pokemons.push(pokemonData);
    });
  }

  // se a var pokemons não for alterada, retorna o valor que já está guardado, se for vazio, apresenta um erro
  return pokemons;
}

async function main() {
  // assim que entrar na página
  document.addEventListener("DOMContentLoaded", () => {
    // assim que entrar no documento, busca todos os pokemons
    pokemons = fetchAllPokemons();
  });
}

main();
