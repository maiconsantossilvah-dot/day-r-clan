# Segurança

## Firestore Rules

As regras usam o documento `clanMembers/{clanId}_{uid}` como autoridade de cargo. O campo `role` do perfil não concede permissão sozinho. Viewers leem; members gerenciam os próprios registros; admins gerenciam dados do clã; owners controlam membros e o clã.

Teste as regras no Emulator Suite antes de produção. O frontend não é barreira de segurança.

## Conteúdo da wiki e XSS

- wikitext/HTML remoto não é inserido diretamente no DOM;
- o snapshot contém somente strings e metadados normalizados;
- textos passam por escape antes de templates controlados;
- URLs externas aceitam somente `http:` e `https:`;
- links externos usam `rel="noopener noreferrer"`;
- imagens quebradas usam placeholder local.

## Credenciais

`firebase-config.js` fica no `.gitignore`. A configuração Web do Firebase não equivale a uma chave privada, mas chaves de conta de serviço, tokens administrativos e segredos nunca devem chegar ao navegador ou repositório.

## Dados do usuário

No modo demonstração, os dados ficam no LocalStorage do dispositivo. Qualquer pessoa com acesso ao perfil do navegador pode lê-los. Use exportação com cuidado e não registre informações pessoais desnecessárias.

## Limitações

Aplicações estáticas não conseguem esconder segredos nem executar sincronizações confiáveis em segundo plano. A sincronização completa da wiki é feita localmente antes da publicação. O botão no navegador apenas verifica revisões recentes.
