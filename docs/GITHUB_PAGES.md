# Publicação no GitHub Pages

O projeto usa caminhos relativos e Hash Router, por isso funciona em `https://usuario.github.io/day-r-clan-hub/` sem regras de rewrite.

```bash
cd C:\Users\maicons\Downloads\day-r-clan-hub
git init
git add .
git commit -m "Initial Day R Clan Hub"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/day-r-clan-hub.git
git push -u origin main
```

Depois:

1. Abra **Settings** do repositório.
2. Entre em **Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch `main` e a pasta `/ (root)`.
5. Salve e aguarde a URL publicada.
6. Adicione o domínio do Pages aos domínios autorizados do Firebase, se usar login.
7. Atualize `sitemap.xml` e o canonical comentado em `index.html` com a URL real.

Não há remote configurado automaticamente neste projeto.
