# TODO — Gestor de Estoque

## Cadastro e consulta de produtos
- [x] O gestor deve permitir cadastrar e editar produtos com SKU, nome, categoria, unidade, custo, preço e estoque mínimo.
- [x] A listagem deve permitir busca, filtros por categoria e status, ordenação e visualização do saldo atual.

## Movimentações e rastreabilidade
- [x] Deve ser possível registrar entradas, saídas e ajustes de estoque com quantidade, data, motivo e observações.
- [x] O histórico de movimentações por produto deve permitir auditoria e rastreabilidade.
- [x] Deve validar os dados e impedir saídas superiores ao saldo disponível.

## Painel e alertas operacionais
- [x] O painel deve exibir indicadores da quantidade de itens, valor estimado do estoque e produtos com saldo baixo ou zerado.
- [x] Produtos no nível mínimo e esgotados devem gerar alertas visuais.

## Personalização para qualquer empresa
- [x] Permitir configurar nome da empresa, responsável, frase do painel e moeda.
- [x] Permitir personalizar cores principais, destaque e fundo com presets de tema.
- [x] Permitir exportar um backup JSON completo dos dados e restaurar os dados demonstrativos.
- [x] Exibir onboarding como primeira tela, sem dados de exemplo, com criação de empresa vazia.
- [x] Salvar a empresa ativa em cookie e separar os dados locais por empresa neste navegador.
- [x] Permitir entrar por nome em empresas já salvas e trocar de empresa pelas configurações.

## Verificação antes da publicação
- [x] Os fluxos críticos devem ter testes automatizados e verificação funcional concluída antes da publicação.

## Repositório e publicação
- [x] Criar um repositório na conta Git do usuário, versionar o código e publicar o projeto com instruções de execução.
- [ ] Publicar a aplicação e confirmar a URL acessível antes de informar o resultado.
