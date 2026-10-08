# Day R Clan Hub

Aplicação web comunitária para organizar catálogo, estoques, pedidos, trocas, tutoriais e membros de clãs de Day R Survival. O projeto funciona como site estático, sem npm ou etapa de build obrigatória, e está preparado para GitHub Pages.

> O Day R Clan Hub não é oficial e não possui vínculo com os desenvolvedores de Day R Survival. Estoques e negociações representam somente declarações dos usuários.

## Estado do catálogo

- Fonte primária inicial: [Day R Wiki](https://dayr.wiki.gg) em inglês.
- Cache atual: 865 itens rastreáveis.
- Imagens/miniaturas encontradas: 848.
- Descrições em pt-BR: 436 traduções incrementais, com o original em inglês preservado.
- Cada registro guarda página, revisão, data da revisão, versão declarada quando disponível e data de sincronização.
- O catálogo não foi criado pela IA: ele foi coletado pela MediaWiki API e salvo em `data/wiki-items.json`.
- Informações podem mudar após atualizações do jogo. Abra a página de origem antes de tomar decisões importantes.

## Recursos

- catálogo da wiki com pesquisa bilíngue, descrições em pt-BR, texto original auditável, filtros, miniaturas, histórico e página detalhada;
- separação entre “Dados da fonte” e “Dados do clã”;
- cache estático e fallback em LocalStorage;
- estoque pessoal e agregado, com quantidade reservada e disponível;
- pedidos com prioridades, progresso e contribuições individuais;
- mercado interno, estados de entrega, tabelas e calculadora bidirecional;
- tutoriais com etapas, itens vinculados e verificação de recursos;
- pedidos automáticos para requisitos faltantes;
- membros, cargos, atividades e notificações internas;
- tela Fontes com score interno de frescor e verificação incremental;
- modo demonstração persistente, importação/exportação JSON, tema claro/escuro;
- PWA responsiva e acessível, com rotas por hash compatíveis com GitHub Pages;
- integração opcional com Firebase Authentication e Cloud Firestore.

## Tecnologias

HTML5, CSS3, JavaScript ES Modules, MediaWiki API, Firebase Web SDK modular por CDN, Lucide Icons, LocalStorage, Service Worker e PWA. Não usa React, Vue, Angular, bundler ou biblioteca CSS.

## Executar localmente

O uso de um servidor HTTP é obrigatório para módulos ES e Service Worker.

```bash
cd C:\Users\maicons\Downloads\day-r-clan-hub
python -m http.server 8000
```

Se Python não estiver disponível e Node já estiver instalado:

```bash
npx --yes http-server . -p 8000
```

Também é possível usar qualquer servidor estático do editor. Acesse `http://localhost:8000/`.

## Modo demonstração

Sem `firebase-config.js`, o sistema inicia em modo demonstração e guarda dados do clã em LocalStorage. O catálogo continua vindo do cache versionado da wiki.

- use **Configurações → Exportar JSON** para criar uma cópia;
- use **Importar JSON** para restaurar um arquivo válido;
- **Resetar demonstração** recria os dados do clã, mas preserva o cache da wiki.

## Atualizar a wiki

O sincronizador usa paginação, revisões, pausas entre requisições e não baixa imagens em massa. Ele armazena somente URLs e metadados fornecidos pela própria wiki.

```bash
python tools/sync-wiki.py
```

Alternativa sem dependências quando apenas Node estiver instalado:

```bash
node tools/sync-wiki.mjs
```

Depois, revise `data/wiki-sync-state.json` e publique os dois arquivos em `data/`. Consulte [docs/WIKI_SYNC.md](docs/WIKI_SYNC.md).

## Firebase

1. Copie `assets/js/firebase/firebase-config.example.js` para `assets/js/firebase/firebase-config.js`.
2. Preencha somente a configuração Web fornecida pelo Firebase Console.
3. Habilite Authentication por e-mail/senha e Cloud Firestore.
4. Publique `firestore.rules` e `firestore.indexes.json`.

As chaves de configuração Web identificam o projeto, mas não substituem regras seguras. Nunca inclua chave privada ou credencial de conta de serviço. Veja [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

## GitHub Pages

Todos os caminhos são relativos e a navegação usa `#/rota`, portanto o projeto funciona em subdiretórios como `usuario.github.io/day-r-clan-hub/`. Não há remote configurado nem push automático. Veja [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).

## Estrutura

```text
assets/js/
  components/   componentes reutilizáveis
  firebase/     autenticação e sincronização opcional
  modules/      telas e fluxos da aplicação
  services/     operações de domínio
  utils/        validação, formatação e constantes
  wiki/         fonte, API, cache, parser e frescor
data/           snapshot e estado da sincronização
docs/           guias técnicos e de segurança
tools/          sincronizadores da MediaWiki
```

Consulte `docs/SEARCH_PTBR.md` para ampliar os aliases de pesquisa e `docs/TRANSLATIONS.md` para atualizar as descrições em pt-BR.

## Segurança e limitações

- conteúdo da wiki é tratado como não confiável e exibido como texto, não como HTML executável;
- URLs são limitadas a HTTP/HTTPS;
- itens sincronizados são somente leitura; notas internas ficam em `clanNotes`;
- o Service Worker guarda no máximo 80 imagens da wiki já visitadas;
- o navegador apenas verifica revisões recentes; a sincronização completa é feita pela ferramenta local;
- campos ausentes permanecem nulos ou indisponíveis, sem preenchimento inventado;
- confira licenças e atribuições na página de cada arquivo da wiki.

## Roadmap

### v0.1

Catálogo, cache, estoque, pedidos, trocas, tutoriais, Firebase opcional e PWA.

### v0.2

Notificações avançadas, estatísticas, convites melhores e histórico detalhado.

### v0.3

Integrações opcionais, Discord, importação de outros datasets e catálogo comunitário público.

## Contribuição

Abra uma branch, mantenha a separação entre dados da wiki e do clã, não inclua credenciais e valide o modo offline antes de enviar alterações.

## Licença

O código deste repositório usa a licença MIT. Dados e imagens referenciados da Day R Wiki mantêm suas próprias licenças e atribuições; consulte a página de origem de cada item/arquivo.
