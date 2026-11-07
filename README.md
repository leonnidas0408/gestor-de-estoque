# Gestor de Estoque

Aplicação web responsiva para acompanhar produtos, saldo, movimentações, despesas, categorias e relatórios. Interface em português, baseada nos arquivos HTML/CSS/JavaScript entregues e nos dados armazenados no próprio navegador.

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

## Dados e privacidade

Os dados são salvos no `localStorage` do navegador utilizado e não são enviados a um servidor. Eles não são sincronizados entre navegadores, perfis ou dispositivos. Para cópia e transporte, use as opções CSV da tela Relatórios; exportações disponíveis abrangem produtos, despesas e categorias. O conjunto inicial contém exemplos demonstrativos.
