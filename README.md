# Gestor de Tarefas

Aplicação web para organizar tarefas do dia a dia, feita com **HTML, CSS e JavaScript puro**, sem frameworks nem bibliotecas.

🔗 **Demo:** _adicione aqui o link do GitHub Pages_

![Captura de tela do projeto](./screenshot.png)

## Funcionalidades

- Adicionar, editar, concluir e excluir tarefas
- Prioridade (alta, média, baixa) e prazo opcional
- Aviso visual para tarefas atrasadas
- Filtros: todas, pendentes e concluídas
- Busca por texto
- Barra de progresso com o percentual de tarefas concluídas
- Remoção de todas as tarefas concluídas de uma vez
- Dados salvos no navegador (`localStorage`), sem perder nada ao recarregar
- Tema claro e escuro, respeitando a preferência do sistema
- Layout responsivo (celular e desktop)
- Acessível: navegação por teclado, `aria-label`, foco visível e respeito a `prefers-reduced-motion`

## Tecnologias

- HTML5 semântico
- CSS3 (variáveis CSS, Grid, Flexbox, temas)
- JavaScript ES6+ (funções separadas por responsabilidade, delegação de eventos, `localStorage`)

## Como rodar

```bash
git clone https://github.com/SEU-USUARIO/gestor-de-tarefas.git
cd gestor-de-tarefas
```

Abra o arquivo `index.html` no navegador. Não há dependências nem etapa de build.

## Estrutura

```
gestor-de-tarefas/
├── index.html   # estrutura da página
├── style.css    # estilos e temas
├── script.js    # lógica da aplicação
└── README.md
```

## O que este projeto demonstra

- **Manipulação do DOM** de forma segura (`textContent` em vez de `innerHTML`, evitando injeção de HTML)
- **Gerenciamento de estado** simples: um array de tarefas como fonte única da verdade e uma função `renderizar()` que redesenha a lista
- **Delegação de eventos**: um único listener para todos os itens da lista
- **Persistência de dados** com tratamento de erros no `localStorage`
- **Boas práticas de acessibilidade e responsividade**

## Próximos passos (ideias)

- [ ] Arrastar e soltar para reordenar
- [ ] Categorias ou etiquetas
- [ ] Exportar e importar tarefas em JSON
- [ ] Testes automatizados com Vitest