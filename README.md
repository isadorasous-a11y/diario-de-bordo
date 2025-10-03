# 📘 Diário de Bordo (PWA)

Aplicativo Web Progressivo (PWA) desenvolvido como prática EBAC.  
Permite registrar, listar e remover atividades diárias, com suporte a **offline**, **instalação** e **persistência de dados**.

## 🚀 Funcionalidades
- Criar entradas com título, descrição e data.
- Listar e remover entradas salvas.
- Persistência de dados usando **localStorage**.
- Funciona **offline** graças ao **Service Worker**.
- Instalável como aplicativo no celular ou desktop.
- Exportação das entradas em formato JSON.

## 📱 PWA
- Manifest.json configurado com ícones 192x192 e 512x512.
- Service Worker para cache e funcionamento offline.
- Instalação via evento `beforeinstallprompt`.

## 🛠 Tecnologias
- HTML5, CSS3, JavaScript (Vanilla)
- Padrões **PWA**
- LocalStorage API
- GitHub Pages

## 🌐 Deploy
Acesse o app:  
👉 [Diário de Bordo Online](https://isadorasous-a11y.github.io/diario-de-bordo/)

## ▶️ Rodar localmente
Clone o repositório:
```bash
git clone https://github.com/isadorasous-a11y/diario-de-bordo.git
cd diario-de-bordo
