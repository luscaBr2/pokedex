// Script destinado a recolher as informações da API do pokemon

const pokemonImage = document.getElementById("pokemon-image");
const pokemonName = document.getElementById("pokemon-name");
const pokemonID = document.getElementById("pokemon-id");
const pesquisaInput = document.getElementById("pesquisa");
const mainContainer = document.querySelector(".container-pokemon");
const mensagemInterna = document.getElementById("mensagem-interna");
const imgLoading = document.getElementById("loading");
const imgErro = document.getElementById("erro");

let pilhaErros = []; // destinado a empilhar os erros para serem exibidos de acordo com a ordem de chegada

let Allpokemons = []; // destinado a guardar todos os pokemons

// Constantes para cache
const CACHE_KEY = 'pokemon_cache';
const CACHE_TIMESTAMP_KEY = 'pokemon_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
const TOTAL_POKEMONS = 1302; // total vindo da API
const FIRST_BATCH_LIMIT = 151; // quantidade inicial a exibir
const BACKGROUND_BATCH_SIZE = 30; // concorrência em segundo plano

// Função para verificar se o cache é válido
function isCacheValid() {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return false;
    
    try {
        const parsed = JSON.parse(cacheData);
        const now = Date.now();
        return (now - parsed.timestamp) < CACHE_DURATION;
    } catch (error) {
        return false;
    }
}

// Função para salvar dados no cache
function saveToCache(pokemons) {
    try {
        const cacheData = {
            pokemons: JSON.parse(pokemons),
            timestamp: Date.now()
        };

        // guarda em localStorage o array de pokemons e a data de criação do cache
        localStorage.setItem(CACHE_KEY, cacheData.pokemons);
        localStorage.setItem(CACHE_TIMESTAMP_KEY, cacheData.timestamp);
    } catch (error) {
        console.warn('Erro ao salvar cache:', error);
    }
}

// Função para carregar dados do cache
function loadFromCache() {
    try {
        const cacheData = localStorage.getItem(CACHE_KEY);
        if (cacheData) {
            return cacheData;
        }
    } catch (error) {
        console.warn('Erro ao carregar cache:', error);
    }
    return null;
}

async function resetarBusca() {
    pesquisaInput.value = "";

    try {
        if (Allpokemons.length > 0) {
            renderPokemon(Allpokemons);
        } else {
            throw new Error("Nenhum pokemon encontrado.");
        }

        atualizarSugestoes(Allpokemons); // função presente no arquivo utils\sugestoesPesquisa.js
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
}

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

function resetContainerPokemon() {
    mainContainer.innerHTML = `<div id="erro" class="hidden"><img src="https://img.icons8.com/?size=100&id=8122&format=png&color=ff1616" alt="Erro"></div><div id="loading"></div><div id="mensagem-interna"></div>`;
}

async function requisitarAPI(linkRequisicao) {
    try {
        mostrarLoading();
        editarMensagemInterna("Conectando com a API...");

        const APIResponse = await fetch(linkRequisicao);

        // se a resposta da API não for 200, retorna erro
        if (!APIResponse.ok)
            throw new Error("Erro na requisição da API: " + APIResponse.status);

        editarMensagemInterna(
            "Conectado com a API :) <br> Buscando pokemons..."
        );

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
        const data = await requisitarAPI(url);
        return data;
    } catch (error) {
        mostrarErro();
        esconderLoading();
        editarMensagemInterna(
            "Falha ao buscar o pokemon pela URL. Erro: " + error
        );
        pilhaErros.push("Falha ao buscar o pokemon pela URL. Erro: " + error);

        return null;
    }
}

/// busca um pokemon pelo nome ou id
async function fetchPokemon(pokemon) {
    try {
        const data = await requisitarAPI(
            "https://pokeapi.co/api/v2/pokemon/" + pokemon
        );
        return data;
    } catch (error) {
        mostrarErro();
        esconderLoading();
        editarMensagemInterna("Falha ao buscar o pokemon. Erro: " + error);

        return null;
    }
}

// Busca a lista (nome/url) de pokémons
async function fetchPokemonList(limit, offset) {
    try {
        return await requisitarAPI(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    } catch (error) {
        mostrarErro();
        esconderLoading();
        editarMensagemInterna("Falha ao buscar a lista de pokémons. Erro: " + error);
        pilhaErros.push("Falha ao buscar a lista de pokémons. Erro: " + error);
        return null;
    }
}

// Busca detalhes para um conjunto de URLs em lotes, controlando concorrência
async function fetchInBatches(urls, batchSize = BACKGROUND_BATCH_SIZE) {
    const resultados = [];
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const dados = await Promise.all(batch.map((url) => fetchPokemonByURL(url)));
        resultados.push(...dados.filter(Boolean));
    }
    return resultados;
}

// Busca os primeiros 151 pokémons (detalhes) para exibição
async function fetchFirstBatch() {
    try {
        const data = await fetchPokemonList(FIRST_BATCH_LIMIT, 0);
        if (!data || !data.results) return [];
        return await Promise.all(
            data.results.map((pokemon) => fetchPokemonByURL(pokemon.url))
        );
    } catch (error) {
        mostrarErro();
        esconderLoading();
        editarMensagemInterna(
            "Falha ao buscar os primeiros pokémons. Erro: " + error
        );
        pilhaErros.push("Falha ao buscar os primeiros pokémons. Erro: " + error);
        return [];
    }
}

// Busca o restante dos pokémons em segundo plano e salva no cache
async function carregarRestanteEmBackground(listaBase) {
    try {
        const jaTemos = Array.isArray(listaBase) ? listaBase.length : 0;
        if (jaTemos >= TOTAL_POKEMONS) {
            saveToCache(listaBase);
            return;
        }

        const listaCompleta = await fetchPokemonList(TOTAL_POKEMONS, 0);
        if (!listaCompleta || !listaCompleta.results) return;

        const urlsRestantes = listaCompleta.results
            .slice(jaTemos)
            .map((p) => p.url);

        const detalhesRestantes = await fetchInBatches(urlsRestantes, BACKGROUND_BATCH_SIZE);
        const todos = (Array.isArray(listaBase) ? listaBase : []).concat(detalhesRestantes);
        saveToCache(todos);
    } catch (error) {
        console.warn('Falha ao carregar restante em background:', error);
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
        editarMensagemInterna(
            "Falha ao buscar todos os pokemons. Erro: " + error
        );
        pilhaErros.push("Falha ao buscar todos os pokemons. Erro: " + error);

        return []; // Retorna array vazio em caso de erro
    }
}

// renderiza os pokemons na tela, usando array global com as informações de pokemons
// recebe um array
function renderPokemon(pokemons) {
    try {
        // limpa o container de pokemons
        mainContainer.innerHTML = "";

        pokemons.forEach((pokemon) => {
            let imgPokemon =
                pokemon["sprites"]["versions"]["generation-v"]["black-white"][
                    "animated"
                ]["front_default"];
            let nomePokemon = pokemon["name"];
            let idPokemon = pokemon["id"];

            // adicionar cards com os dados dos pokemons
            mainContainer.innerHTML += `<div class="pokemon-card"> <img id="pokemon-image" src="${imgPokemon}"> <h3> <span id="pokemon-id">${idPokemon}</span> - <span id="pokemon-name">${nomePokemon}</span> </h3> </div>`;
        });
    } catch (error) {
        mostrarErro();
        esconderLoading();
        editarMensagemInterna(
            "Falha ao renderizar os pokemons. Erro: " + error
        );
        pilhaErros.push("Falha ao renderizar os pokemons. Erro: " + error);
    }
}

// Função para carregar pokémons com cache
async function carregarPokemonsComCache() {
    try {
        // Primeiro, tenta carregar do cache
        const cachedPokemons = loadFromCache();

        // se os pokemons existirem em cache e o cache for válido, carrega os pokemons do cache em AllPokemons
        if (cachedPokemons && isCacheValid()) {
            editarMensagemInterna("Carregando pokémons do cache...");
            Allpokemons = cachedPokemons;
            renderPokemon(Allpokemons);
            atualizarSugestoes(Allpokemons);
            esconderLoading();
            editarMensagemInterna("Pokémons carregados do cache! :)");
            return;
        }

        // Se não há cache válido, busca os primeiros 151, exibe e inicia background
        editarMensagemInterna("Cache expirado ou não encontrado. Buscando 151 pokémons...");
        Allpokemons = await fetchFirstBatch();

        if (Allpokemons.length > 0) {
            renderPokemon(Allpokemons);
            atualizarSugestoes(Allpokemons);
            esconderLoading();
            editarMensagemInterna("151 pokémons carregados. Buscando o restante em segundo plano...");
            // dispara em segundo plano sem bloquear a UI
            carregarRestanteEmBackground(Allpokemons).catch((e) => console.warn('BG error:', e));
        } else {
            throw new Error("Nenhum pokemon encontrado.");
        }
    } catch (error) {
        mostrarErro();
        esconderLoading();

        pilhaErros.push("Falha ao carregar os pokemons. " + error);

        // mostra todos os erros que ocorreram na execução do programa
        if (pilhaErros.length > 0) {
            editarMensagemInterna(pilhaErros.join("<br>"));
        }
    }
}

async function main() {
    document.addEventListener("DOMContentLoaded", async () => {
        // Inicia o carregamento imediatamente
        await carregarPokemonsComCache();
    });
}

main();
