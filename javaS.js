"use strict";

const CHAVE_STORAGE = "gestor-tarefas:v1";

/* ---------- Estado ---------- */

let tarefas = carregarTarefas();
let filtroAtual = "todas";
let termoBusca = "";
let editandoId = null;
let novaId = null; // animar a tarefa 

const formTarefa = document.getElementById("form-tarefa");
const inputTitulo = document.getElementById("titulo");
const selectPrioridade = document.getElementById("prioridade");
const inputPrazo = document.getElementById("prazo");
const inputBusca = document.getElementById("busca");
const listaEl = document.getElementById("lista");
const vazioEl = document.getElementById("vazio");
const erroEl = document.getElementById("erro");
const resumoEl = document.getElementById("resumo");
const barraEl = document.getElementById("barra");
const progressoEl = document.getElementById("progresso");
const filtrosEl = document.getElementById("filtros");
const btnLimpar = document.getElementById("btn-limpar");
const btnTema = document.getElementById("btn-tema");
const btnTemaTexto = document.getElementById("btn-tema-texto");

/* ---------- Persistência ---------- */

function carregarTarefas() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
    return Array.isArray(dados) ? dados : [];
  } catch (e) {
    return [];
  }
}

function salvarTarefas() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
  } catch (e) {
    mostrarErro("Não foi possível salvar. O armazenamento do navegador pode estar bloqueado.");
  }
}


function adicionarTarefa(titulo, prioridade, prazo) {
  const tarefa = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    titulo,
    prioridade,
    prazo: prazo || "",
    concluida: false,
    criadaEm: Date.now(),
  };
  tarefas.push(tarefa);
  novaId = tarefa.id;
  salvarTarefas();
  renderizar();
}

function alternarConclusao(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;
  tarefa.concluida = !tarefa.concluida;
  salvarTarefas();
  renderizar();
}

function editarTitulo(id, novoTitulo) {
  const tarefa = tarefas.find((t) => t.id === id);
  const titulo = novoTitulo.trim();
  if (!tarefa || !titulo) return false;
  tarefa.titulo = titulo;
  salvarTarefas();
  return true;
}

function excluirTarefa(id) {
  tarefas = tarefas.filter((t) => t.id !== id);
  salvarTarefas();
  renderizar();
}

function removerConcluidas() {
  tarefas = tarefas.filter((t) => !t.concluida);
  salvarTarefas();
  renderizar();
}



const PESO_PRIORIDADE = { alta: 0, media: 1, baixa: 2 };

function tarefasVisiveis() {
  const termo = termoBusca.trim().toLowerCase();

  return tarefas
    .filter((t) => {
      if (filtroAtual === "pendentes" && t.concluida) return false;
      if (filtroAtual === "concluidas" && !t.concluida) return false;
      if (termo && !t.titulo.toLowerCase().includes(termo)) return false;
      return true;
    })
    .sort((a, b) => {
      // Pendentes primeiro, depois prioridade, depois prazo, depois criação
      if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
      if (a.prioridade !== b.prioridade) {
        return PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
      }
      if (a.prazo !== b.prazo) {
        if (!a.prazo) return 1;
        if (!b.prazo) return -1;
        return a.prazo.localeCompare(b.prazo);
      }
      return a.criadaEm - b.criadaEm;
    });
}

/* ---------- Datas ---------- */

function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}



const ROTULO_PRIORIDADE = { alta: "Alta", media: "Média", baixa: "Baixa" };

function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto; // textContent evita injeção de HTML
  return el;
}

function criarItem(tarefa) {
  const li = criarElemento("li", "tarefa");
  li.dataset.id = tarefa.id;
  li.dataset.prioridade = tarefa.prioridade;
  if (tarefa.concluida) li.classList.add("is-concluida");
  if (tarefa.id === novaId) li.classList.add("is-nova");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = tarefa.concluida;
  checkbox.dataset.acao = "alternar";
  checkbox.setAttribute("aria-label", `Marcar "${tarefa.titulo}" como concluída`);
  li.appendChild(checkbox);

  const conteudo = criarElemento("div", "tarefa__conteudo");

  if (tarefa.id === editandoId) {
    const campo = document.createElement("input");
    campo.type = "text";
    campo.className = "tarefa__edicao";
    campo.value = tarefa.titulo;
    campo.maxLength = 100;
    campo.dataset.edicao = tarefa.id;
    campo.setAttribute("aria-label", "Editar título da tarefa");
    conteudo.appendChild(campo);
  } else {
    conteudo.appendChild(criarElemento("p", "tarefa__titulo", tarefa.titulo));

    const meta = criarElemento("div", "tarefa__meta");
    meta.appendChild(criarElemento("span", "", `Prioridade ${ROTULO_PRIORIDADE[tarefa.prioridade]}`));

    if (tarefa.prazo) {
      const atrasada = !tarefa.concluida && tarefa.prazo < hojeISO();
      const prazo = criarElemento(
        "span",
        atrasada ? "atrasada" : "",
        atrasada ? `Atrasada · ${formatarData(tarefa.prazo)}` : `Prazo ${formatarData(tarefa.prazo)}`
      );
      meta.appendChild(prazo);
    }
    conteudo.appendChild(meta);
  }
  li.appendChild(conteudo);

  // Ações
  const acoes = criarElemento("div", "tarefa__acoes");

  const btnEditar = criarElemento("button", "acao", tarefa.id === editandoId ? "Salvar" : "Editar");
  btnEditar.type = "button";
  btnEditar.dataset.acao = tarefa.id === editandoId ? "salvar" : "editar";
  btnEditar.setAttribute("aria-label", `${btnEditar.textContent} "${tarefa.titulo}"`);
  acoes.appendChild(btnEditar);

  const btnExcluir = criarElemento("button", "acao acao--excluir", "Excluir");
  btnExcluir.type = "button";
  btnExcluir.dataset.acao = "excluir";
  btnExcluir.setAttribute("aria-label", `Excluir "${tarefa.titulo}"`);
  acoes.appendChild(btnExcluir);

  li.appendChild(acoes);
  return li;
}

function renderizar() {
  const visiveis = tarefasVisiveis();

  listaEl.replaceChildren(...visiveis.map(criarItem));
  novaId = null;

  if (visiveis.length === 0) {
    vazioEl.hidden = false;
    if (tarefas.length === 0) {
      vazioEl.textContent = "Nenhuma tarefa por aqui. Adicione a primeira no formulário acima.";
    } else if (termoBusca.trim()) {
      vazioEl.textContent = `Nenhuma tarefa encontrada para "${termoBusca.trim()}".`;
    } else if (filtroAtual === "pendentes") {
      vazioEl.textContent = "Tudo concluído. Nenhuma tarefa pendente.";
    } else {
      vazioEl.textContent = "Nenhuma tarefa concluída ainda.";
    }
  } else {
    vazioEl.hidden = true;
  }

  atualizarResumo();


  const campoEdicao = listaEl.querySelector("[data-edicao]");
  if (campoEdicao) {
    campoEdicao.focus();
    campoEdicao.setSelectionRange(campoEdicao.value.length, campoEdicao.value.length);
  }
}

function atualizarResumo() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const pendentes = total - concluidas;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  if (total === 0) {
    resumoEl.textContent = "Sem tarefas por enquanto.";
  } else {
    const txtPend = pendentes === 1 ? "1 pendente" : `${pendentes} pendentes`;
    const txtConc = concluidas === 1 ? "1 concluída" : `${concluidas} concluídas`;
    resumoEl.textContent = `${txtPend} · ${txtConc}`;
  }

  barraEl.style.width = `${percentual}%`;
  progressoEl.setAttribute("aria-valuenow", String(percentual));
  progressoEl.setAttribute("aria-valuetext", `${percentual}% das tarefas concluídas`);

  btnLimpar.disabled = concluidas === 0;
}

/* ---------- Mensagens de erro ---------- */

function mostrarErro(mensagem) {
  erroEl.textContent = mensagem;
  erroEl.hidden = false;
}

function esconderErro() {
  erroEl.hidden = true;
  erroEl.textContent = "";
}


formTarefa.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const titulo = inputTitulo.value.trim();

  if (!titulo) {
    mostrarErro("Digite o título da tarefa antes de adicionar.");
    inputTitulo.focus();
    return;
  }

  esconderErro();
  adicionarTarefa(titulo, selectPrioridade.value, inputPrazo.value);

  formTarefa.reset();
  selectPrioridade.value = "media";
  inputTitulo.focus();
});

inputTitulo.addEventListener("input", esconderErro);

inputBusca.addEventListener("input", () => {
  termoBusca = inputBusca.value;
  renderizar();
});

filtrosEl.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-filtro]");
  if (!botao) return;

  filtroAtual = botao.dataset.filtro;
  filtrosEl.querySelectorAll(".filtro").forEach((b) => {
    const ativo = b === botao;
    b.classList.toggle("is-ativo", ativo);
    b.setAttribute("aria-pressed", String(ativo));
  });
  renderizar();
});


listaEl.addEventListener("click", (evento) => {
  const alvo = evento.target.closest("[data-acao]");
  const item = evento.target.closest(".tarefa");
  if (!alvo || !item) return;

  const id = item.dataset.id;

  switch (alvo.dataset.acao) {
    case "alternar":
      alternarConclusao(id);
      break;
    case "editar":
      editandoId = id;
      renderizar();
      break;
    case "salvar":
      finalizarEdicao(id, true);
      break;
    case "excluir":
      excluirTarefa(id);
      break;
  }
});

listaEl.addEventListener("keydown", (evento) => {
  const campo = evento.target.closest("[data-edicao]");
  if (!campo) return;

  if (evento.key === "Enter") {
    evento.preventDefault();
    finalizarEdicao(campo.dataset.edicao, true);
  } else if (evento.key === "Escape") {
    finalizarEdicao(campo.dataset.edicao, false);
  }
});

function finalizarEdicao(id, salvar) {
  if (salvar) {
    const campo = listaEl.querySelector("[data-edicao]");
    const ok = campo ? editarTitulo(id, campo.value) : false;
    if (!ok) {
      mostrarErro("O título da tarefa não pode ficar vazio.");
      return;
    }
    esconderErro();
  }
  editandoId = null;
  renderizar();
}

btnLimpar.addEventListener("click", removerConcluidas);

/* ---------- Tema claro/escuro ---------- */

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  btnTemaTexto.textContent = tema === "escuro" ? "Modo claro" : "Modo escuro";
  try {
    localStorage.setItem("tema", tema);
  } catch (e) {
  }
}

btnTema.addEventListener("click", () => {
  const atual = document.documentElement.dataset.tema;
  aplicarTema(atual === "escuro" ? "claro" : "escuro");
});


btnTemaTexto.textContent =
  document.documentElement.dataset.tema === "escuro" ? "Modo claro" : "Modo escuro";
renderizar();
