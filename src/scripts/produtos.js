import { Store } from './store.js';
import { Helpers } from '../utils/helpers.js';
import { Dashboard } from './dashboard.js';
import { Estoque } from './estoque.js';
import { Movimentacoes } from './movimentacoes.js';

export const Produtos = {
  init() {
    document.getElementById('btn-novo-produto').onclick = () => this.abrirForm();
    document.getElementById('btn-cancelar-produto').onclick = () => this.fecharForm();
    document.getElementById('form-produto').onsubmit = (e) => this.salvar(e);
    document.getElementById('busca-produto').oninput = () => this.render();
  },

  render() {
    const busca = document.getElementById('busca-produto').value.toLowerCase();
    const tbody = document.querySelector('#tabela-produtos tbody');
    const lista = Store.produtos.filter(p => p.nome.toLowerCase().includes(busca));

    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty">Nenhum produto encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(p => `
      <tr>
        <td><code>${p.id.slice(0, 8)}</code></td>
        <td>${Helpers.esc(p.nome)}</td>
        <td>${Helpers.esc(p.categoria)}</td>
        <td>${p.quantidade}</td>
        <td>${Helpers.formatarMoeda(p.precoCusto)}</td>
        <td>${Helpers.formatarMoeda(p.precoVenda)}</td>
        <td>${Helpers.formatarData(p.dataCadastro)}</td>
        <td>
          <button class="btn small" data-action="edit" data-id="${p.id}">✏️</button>
          <button class="btn small danger" data-action="del" data-id="${p.id}">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit"]').forEach(btn =>
      btn.onclick = () => this.editar(btn.dataset.id)
    );
    tbody.querySelectorAll('[data-action="del"]').forEach(btn =>
      btn.onclick = () => this.excluir(btn.dataset.id)
    );
  },

  abrirForm(produto = null) {
    const panel = document.getElementById('form-produto-panel');
    const form = document.getElementById('form-produto');

    // 1) Destrava tudo, limpa tudo, sem exceção
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
      el.style.pointerEvents = '';
      el.style.opacity = '';
    });

    panel.classList.remove('hidden');
    document.getElementById('form-produto-title').textContent =
      produto ? 'Editar Produto' : 'Cadastrar Produto';

    document.getElementById('produto-id').value = produto?.id || '';
    document.getElementById('produto-nome').value = produto?.nome || '';
    document.getElementById('produto-categoria').value = produto?.categoria || '';
    document.getElementById('produto-descricao').value = produto?.descricao || '';
    document.getElementById('produto-quantidade').value = produto?.quantidade ?? '';
    document.getElementById('produto-custo').value = produto?.precoCusto ?? '';
    document.getElementById('produto-venda').value = produto?.precoVenda ?? '';

    // 2) Foco no primeiro campo
    setTimeout(() => document.getElementById('produto-nome').focus(), 30);
  },

  fecharForm() {
    document.getElementById('form-produto-panel').classList.add('hidden');
    const form = document.getElementById('form-produto');
    form.reset();
    document.getElementById('produto-id').value = '';
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
    });
  },

  async salvar(e) {
    e.preventDefault();
    const id = document.getElementById('produto-id').value;

    const dados = {
      nome: document.getElementById('produto-nome').value.trim(),
      categoria: document.getElementById('produto-categoria').value.trim(),
      descricao: document.getElementById('produto-descricao').value.trim(),
      quantidade: Number(document.getElementById('produto-quantidade').value) || 0,
      precoCusto: Number(document.getElementById('produto-custo').value),
      precoVenda: Number(document.getElementById('produto-venda').value)
    };

    if (id) {
      // Edição: substitui TODOS os campos, inclusive quantidade
      const idx = Store.produtos.findIndex(p => p.id === id);
      Store.produtos[idx] = {
        ...Store.produtos[idx],
        ...dados,
        dataCadastro: Store.produtos[idx].dataCadastro
      };
      Helpers.toast('Produto atualizado!', 'success');
    } else {
      Store.produtos.push({
        id: Helpers.gerarId(),
        ...dados,
        dataCadastro: new Date().toISOString()
      });
      Helpers.toast('Produto cadastrado!', 'success');
    }

    await Store.salvarProdutos();
    this.fecharForm();
    this.render();
    Dashboard.render();
    Estoque.render();
    Movimentacoes.atualizarSelect();
  },

  editar(id) {
    const p = Store.produtos.find(x => x.id === id);
    if (p) this.abrirForm(p);
  },

  async excluir(id) {
    if (!confirm('Excluir este produto? As movimentações relacionadas serão mantidas no histórico.')) return;
    Store.produtos = Store.produtos.filter(p => p.id !== id);
    await Store.salvarProdutos();
    this.render();
    Dashboard.render();
    Estoque.render();
    Movimentacoes.atualizarSelect();
    Helpers.toast('Produto excluído.', 'success');
  }
};