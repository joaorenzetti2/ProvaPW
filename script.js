const buscaPesquisa = document.getElementById("buscaPesquisa");
const totalFiltro = document.getElementById("filtroStyle");
const typeFiltro = document.getElementById("typeFiltro");
const qtdeFiltro = document.getElementById("qtdeFiltro");
const filtroIni = document.getElementById("filtroIni");
const filtroFinal = document.getElementById("filtroFinal");
const filtro = document.getElementById("filtro");
const filtroDialog = document.getElementById("filtroDialog");
const fecharDialog = document.getElementById("fecharDialog");
const pagina = document.getElementById("pagina");
const ul_noticia = document.getElementById("ul_noticia");

filtro.addEventListener("click", () => {
    filtroDialog.showModal();
});

fecharDialog.addEventListener("click", () => {
    filtroDialog.close();
});

trazerInformacoesFiltradas();

function trazerInformacoesFiltradas() {
    setFiltros();
    getQuantidadeFiltros();
    getNoticias().then((noticias) => {
        while (ul_noticia.lastChild) {
            ul_noticia.removeChild(ul_noticia.lastChild);
        }
        createCardsWithNoticias(noticias);
        criarPaginas(noticias.totalPages, noticias.page);
    });
}

async function getNoticias() {
    const dados = await fetch(
        `https://servicodados.ibge.gov.br/api/v3/noticias/${window.location.search}`
    );
    return await dados.json();
}

function createCardsWithNoticias(noticias) {
    noticias.items.forEach((n) => adicionarFilho(ul_noticia, createCard(n)));
}

function setFiltros() {
    const url = new URL(window.location);
    buscaPesquisa.value = url.searchParams.get("busca") ?? "";
    typeFiltro.value = url.searchParams.get("tipo") ?? "";
    qtdeFiltro.value = url.searchParams.get("qtd") ?? "10";
    filtroIni.value = url.searchParams.get("de") ?? "";
    filtroFinal.value = url.searchParams.get("ate") ?? "";
    url.searchParams.set("qtd", qtdeFiltro.value);
    url.searchParams.set("page", url.searchParams.get("page") ?? "1");
    window.history.pushState({}, "", url);
}

function busca(event) {
    event.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set("busca", buscaPesquisa.value);
    if (buscaPesquisa.value === "") {
        url.searchParams.delete("busca");
    }
    url.searchParams.set("page", "1");
    window.history.pushState({}, "", url);
    trazerInformacoesFiltradas();
}

function aplicarFiltro(event) {
    event.preventDefault();
    const url = new URL(window.location);
    url.searchParams.set("qtd", qtdeFiltro.value);
    typeFiltro.value
        ? url.searchParams.set("tipo", typeFiltro.value)
        : url.searchParams.delete("tipo");
    filtroIni.value
        ? url.searchParams.set("de", filtroIni.value)
        : url.searchParams.delete("de");
    filtroFinal.value
        ? url.searchParams.set("ate", filtroFinal.value)
        : url.searchParams.delete("ate");
    filtroDialog.close();
    url.searchParams.set("page", "1");
    window.history.pushState({}, "", url);
    trazerInformacoesFiltradas();
}

function getQuantidadeFiltros() {
    const params = new URL(window.location).searchParams;
    let totalFiltros = 0;
    params.forEach((value, key) => {
        if (key !== "page" && key !== "busca") {
            totalFiltros++;
        }
    });
    totalFiltro.innerText = totalFiltros;
}

function createCard(noticia) {
    const li = criarElementoHTML("li");
    const img = criarElementoHTML("img");
    const divTexto = criarElementoHTML("div");
    const titulo = criarElementoHTML("h2");
    const paragrafo = criarElementoHTML("p");
    const divSepararEditoriasPublicado = criarElementoHTML("div");
    const editorias = criarElementoHTML("p");
    const publicado = criarElementoHTML("p");
    const botaoLerMais = criarElementoHTML("button");

    img.src = getImagem(noticia.imagens);
    img.alt = "Imagem da notícia";

    titulo.textContent = noticia.titulo;
    paragrafo.textContent = noticia.introducao;
    editorias.textContent = getEditorias(noticia.editorias);
    publicado.textContent = getPublicado(noticia.data_publicacao);

    divTexto.setAttribute("id", "texto-listagem");

    botaoLerMais.textContent = "Ler Mais";
    botaoLerMais.addEventListener("click", () => {
        window.open(noticia.link, "_blank");
    });

    adicionarClasses(botaoLerMais, ["width100", "botao-noticia"]);
    adicionarClasses(divSepararEditoriasPublicado, [
        "flex",
        "center-space-between",
    ]);
    adicionarClasses(divTexto, ["width100", "flex-column", "gap-10"]);
    adicionarClasses(img, ["imagem-noticia"]);
    adicionarClasses(li, ["card-noticia"]);

    adicionarFilho(divSepararEditoriasPublicado, editorias);
    adicionarFilho(divSepararEditoriasPublicado, publicado);

    adicionarFilho(divTexto, titulo);
    adicionarFilho(divTexto, paragrafo);
    adicionarFilho(divTexto, divSepararEditoriasPublicado);
    adicionarFilho(divTexto, botaoLerMais);

    adicionarFilho(li, img);
    adicionarFilho(li, divTexto);

    return li;
}

function getImagem(imagem) {
    return (
        "https://agenciadenoticias.ibge.gov.br/" +
        JSON.parse(!!imagem ? imagem : '{"image":{"image_intro": ""}}').image_intro
    );
}

function getEditorias(editorias) {
    return "#" + editorias.replace(";", " #");
}

function getPublicado(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const differenceInDays = Math.round((today - date) / (1000 * 60 * 60 * 24));
    
    if (differenceInDays === 0) {
        return "Publicado hoje";
    }
    if (differenceInDays === 1) {
        return "Publicado ontem";
    }
    return `Publicado há ${differenceInDays} dias`;
}

function criarElementoHTML(element) {
    return document.createElement(element);
}

function adicionarClasses(element, classes) {
    classes.forEach((c) => {
        element.classList.add(c);
    });
}

function adicionarFilho(pai, filho) {
    pai.appendChild(filho);
}

function criarPaginas(totalPage, paginaAtual) {
    let paginas = "";
    let i = 1;
    if (paginaAtual >= 7 && totalPage > 10) {
        i = paginaAtual - 5;
    }
    if (paginaAtual >= totalPage - 4 && totalPage > 10) {
        i = totalPage - 9;
    }
    const fimPagina = i + 9;
    while (i <= fimPagina && i !== totalPage + 1) {
        paginas += criarPagina(i);
        i++;
    }
    pagina.innerHTML = paginas;
}

function criarPagina(index) {
    const url = new URL(window.location);
    const isAtiva = url.searchParams.get("page") === index.toString();
    return `
        <li>
         <button 
           class="${ isAtiva ? "pagina-ativa" : "pagina" } width100 pointer" 
           type="button" 
           onclick="changePage(this)">${index}
         </button>
        </li>
        `;
}

function changePage(element) {
    const url = new URL(window.location);
    url.searchParams.set("page", element.textContent);
    window.history.pushState({}, "", url);
    trazerInformacoesFiltradas();
}