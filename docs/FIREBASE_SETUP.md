# Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Adicione uma aplicação Web.
3. Copie `assets/js/firebase/firebase-config.example.js` para `assets/js/firebase/firebase-config.js`.
4. Substitua os valores de exemplo pela configuração Web fornecida pelo console.
5. Em **Authentication → Sign-in method**, habilite **Email/Password**.
6. Crie um banco **Cloud Firestore** no modo adequado à sua região.
7. Publique `firestore.rules` e `firestore.indexes.json` pela Firebase CLI ou pelo console.
8. Em **Authentication → Settings → Authorized domains**, adicione `localhost` e o domínio do GitHub Pages.
9. Abra a aplicação, crie a conta e escolha criar um clã ou entrar com convite.

O SDK modular é carregado pela CDN oficial do Firebase, sem npm. Se `firebase-config.js` não existir ou ainda contiver placeholders, a aplicação usa automaticamente o modo demonstração.

## Regras

As regras fornecidas são uma base de MVP e dependem do formato `{clanId}_{uid}` para documentos de membros. Faça testes de leitura, escrita, alteração de cargo e saída de clã no Emulator Suite. Não use `allow read, write: if true` em produção.

## Catálogo

O catálogo da wiki continua no snapshot estático e não é copiado em massa para o Firestore. O Firestore armazena somente itens internos do clã e referências `itemId` usadas em estoque, pedidos, trocas e tutoriais.
