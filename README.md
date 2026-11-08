# Gestor de Estoque

Aplicação web responsiva e local-first para qualquer empresa acompanhar produtos, saldo, movimentações, despesas, categorias e relatórios. O nome da empresa, responsável, frase do painel, moeda e cores do tema são configuráveis em **Configurações**.

## Executar localmente

Requer Node.js 20+ e Python 3. Na raiz do repositório:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Testes e build

```bash
npm test
npm run check
npm run build
```

O build estático é gerado em `dist/` e não exige backend nem serviço de banco de dados.

## Personalização e dados

Os dados são salvos no `localStorage` do navegador utilizado e não são enviados a um servidor. Eles não são sincronizados entre navegadores, perfis ou dispositivos. Use **Configurações** para personalizar a identidade visual e baixar um backup JSON completo. A tela Relatórios também oferece CSVs de produtos, despesas e categorias. O conjunto inicial contém exemplos demonstrativos, que podem ser substituídos pelos dados reais.
