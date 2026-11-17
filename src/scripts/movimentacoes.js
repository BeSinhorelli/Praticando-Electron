import { Store } from './store.js';
import { Helpers } from '../utils/helpers.js';
import { Dashboard } from './dashboard.js';
import { Produtos } from './produtos.js';
import { Estoque } from './estoque.js';

export const Movimentacoes = {
  editandoId: null,

  init() {
    document.getElementById('btn-nova-mov').onclick = () => this.abrirForm();
    document.getElementById('btn-cancelar-mov').onclick = () => this.fecharForm();
    document.getElementById('form-mov').onsubmit = (e) => this.salvar(e);
    this.atualizarSelect();
  },

  atualizarSelect() {
    const sel = document.getElementById('mov-produto');
    sel.innerHTML = '<option value="">-- Selecione --</option>' +
      Store.produtos.map(p => `<option value="${p.id}">${Helpers.esc(p.nome)} (${p.quantidade} un.)</option>`).join('');
  },

  render() {
    const tbody = document.querySelector('#tabela-mov tbody');
    if (Store.movimentacoes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma movimentação registrada.</td></tr>';
      return;
    }

    const lista = [...Store.movimentacoes].sort((a, b) =>
      new Date(b.data) - new Date(a.data)
    );

    tbody.innerHTML = lista.map(m => {
      const produto = Store.produtos.find(p => p.id === m.produtoId);
      const nomeProduto = produto ? Helpers.esc(produto.nome) : '(produto removido)';
      return `
        <tr>
          <td>${Helpers.formatarData(m.data)}</td>
          <td><span class="badge ${m.tipo}">${m.tipo}</span></td>
          <td>${nomeProduto}</td>
          <td>${m.quantidade}</td>
          <td>${Helpers.esc(m.observacao) || '-'}</td>
          <td>
            <button class="btn small" data-action="edit" data-id="${m.id}">✏️</button>
            <button class="btn small danger" data-action="del" data-id="${m.id}">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-action="edit"]').forEach(btn =>
      btn.onclick = () => this.editar(btn.dataset.id)
    );
    tbody.querySelectorAll('[data-action="del"]').forEach(btn =>
      btn.onclick = () => this.excluir(btn.dataset.id)
    );
  },

  abrirForm(mov = null) {
    if (!mov && Store.produtos.length === 0) {
      Helpers.toast('Cadastre um produto antes!', 'error');
      return;
    }

    const panel = document.getElementById('form-mov-panel');
    const form = document.getElementById('form-mov');

    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
    });
    form.reset();
    this.atualizarSelect();

    panel.classList.remove('hidden');
    this.editandoId = mov?.id || null;

    document.getElementById('form-mov-title').textContent =
      mov ? 'Editar Movimentação' : 'Registrar Movimentação';

    if (mov) {
      document.getElementById('mov-tipo').value = mov.tipo;
      document.getElementById('mov-produto').value = mov.produtoId;
      document.getElementById('mov-quantidade').value = mov.quantidade;
      document.getElementById('mov-obs').value = mov.observacao || '';
    }

    setTimeout(() => document.getElementById('mov-tipo').focus(), 30);
  },

  fecharForm() {
    document.getElementById('form-mov-panel').classList.add('hidden');
    const form = document.getElementById('form-mov');
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
    });
    this.editandoId = null;
  },

  editar(id) {
    const mov = Store.movimentacoes.find(m => m.id === id);
    if (mov) this.abrirForm(mov);
  },

  async excluir(id) {
    const mov = Store.movimentacoes.find(m => m.id === id);
    if (!mov) return;
    if (!confirm('Excluir esta movimentação? O estoque será ajustado automaticamente.')) return;

    const produto = Store.produtos.find(p => p.id === mov.produtoId);
    if (produto) {
      produto.quantidade += mov.tipo === 'entrada' ? -mov.quantidade : mov.quantidade;
      if (produto.quantidade < 0) produto.quantidade = 0;
    }

    Store.movimentacoes = Store.movimentacoes.filter(m => m.id !== id);

    await Store.salvarProdutos();
    await Store.salvarMovimentacoes();

    this.render();
    Produtos.render();
    Dashboard.render();
    Estoque.render();
    Helpers.toast('Movimentação excluída e estoque ajustado.', 'success');
  },

  async salvar(e) {
    e.preventDefault();
    const tipo = document.getElementById('mov-tipo').value;
    const produtoId = document.getElementById('mov-produto').value;
    const quantidade = Number(document.getElementById('mov-quantidade').value);
    const observacao = document.getElementById('mov-obs').value.trim();

    const produto = Store.produtos.find(p => p.id === produtoId);
    if (!produto) return Helpers.toast('Produto inválido.', 'error');
    if (quantidade <= 0) return Helpers.toast('Quantidade inválida.', 'error');

    // ===== EDIÇÃO =====
    if (this.editandoId) {
      const original = Store.movimentacoes.find(m => m.id === this.editandoId);
      if (!original) return Helpers.toast('Movimentação não encontrada.', 'error');

      const produtoOriginal = Store.produtos.find(p => p.id === original.produtoId);

      // Reverte efeito antigo
      if (produtoOriginal) {
        produtoOriginal.quantidade += original.tipo === 'entrada'
          ? -original.quantidade
          : original.quantidade;
        if (produtoOriginal.quantidade < 0) produtoOriginal.quantidade = 0;
      }

      // Valida nova saída
      if (tipo === 'saida' && quantidade > produto.quantidade) {
        if (produtoOriginal) {
          produtoOriginal.quantidade += original.tipo === 'entrada'
            ? original.quantidade
            : -original.quantidade;
        }
        return Helpers.toast(
          `Estoque insuficiente! Disponível: ${produto.quantidade}`, 'error'
        );
      }

      // Aplica efeito novo
      produto.quantidade += tipo === 'entrada' ? quantidade : -quantidade;

      original.tipo = tipo;
      original.produtoId = produtoId;
      original.quantidade = quantidade;
      original.observacao = observacao;

      await Store.salvarProdutos();
      await Store.salvarMovimentacoes();

      this.fecharForm();
      this.render();
      Produtos.render();
      Dashboard.render();
      Estoque.render();
      Helpers.toast('Movimentação atualizada!', 'success');
      return;
    }

    // ===== NOVA =====
    if (tipo === 'saida' && quantidade > produto.quantidade) {
      return Helpers.toast(
        `Estoque insuficiente! Disponível: ${produto.quantidade}`, 'error'
      );
    }

    produto.quantidade += tipo === 'entrada' ? quantidade : -quantidade;

    Store.movimentacoes.push({
      id: Helpers.gerarId(),
      produtoId,
      tipo,
      quantidade,
      observacao,
      data: new Date().toISOString()
    });

    await Store.salvarProdutos();
    await Store.salvarMovimentacoes();

    this.fecharForm();
    this.render();
    Produtos.render();
    Dashboard.render();
    Estoque.render();
    Helpers.toast('Movimentação registrada!', 'success');
  }
};