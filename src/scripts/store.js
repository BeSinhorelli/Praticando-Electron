export const Store = {
  produtos: [],
  movimentacoes: [],

  async carregar() {
    this.produtos = await window.api.produtos.listar();
    this.movimentacoes = await window.api.movimentacoes.listar();
  },

  async salvarProdutos() {
    await window.api.produtos.salvar(this.produtos);
  },

  async salvarMovimentacoes() {
    await window.api.movimentacoes.salvar(this.movimentacoes);
  }
};