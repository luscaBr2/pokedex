function extrairID(parametro) {
    return parametro.split(" - ")[0]; // Pega a parte antes do " - "
}

async function pesquisarPokemon(pokemonBuscado) {
    try {
        resetContainerPokemon();

        mostrarLoading();
        editarMensagemInterna("Buscando pelo " + pokemonBuscado);
        idPokemon = extrairID(pokemonBuscado);

        pokemon = await fetchPokemon(idPokemon);

        renderPokemon([pokemon]);
    } catch (error) {
        esconderLoading();
        mostrarErro();
        editarMensagemInterna("Falha ao buscar o pokemon. Erro: " + error);
        pilhaErros.push("Falha ao buscar o pokemon. Erro: " + error);
    }
}
