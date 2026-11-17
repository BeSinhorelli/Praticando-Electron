import { Store } from './store.js';
import { Helpers, ESTOQUE_BAIXO } from '../utils/helpers.js';

export const Estoque = {
  init() {
    document.getElementById('busca-estoque').oninput = () => this.render();
    document.getElementById('filtro-categoria').onchange = () => this.render();
    document.getElementById('filtro-baixo').onchange = () => this.render();
  },

  atualizarCategorias() {
    const cats = [...new Set(Store.produtos.map(p => p.categoria).filter(Boolean))].sort();
    const sel = document.getElementById('filtro-categoria');
    const atual = sel.value;
    sel.innerHTML = '<option value="">Todas as categorias</option>' +
      cats.map(c => `<option value="${Helpers.esc(c)}">${Helpers.esc(c)}</option>`).join('');
    if (cats.includes(atual)) sel.value = atual;
  },

  render() {
    this.atualizarCategorias();
    const busca = document.getElementById('busca-estoque').value.toLowerCase();
    const cat = document.getElementById('filtro-categoria').value;
    const soBaixo = document.getElementById('filtro-baixo').checked;

    const lista = Store.produtos.filter(p =>
      p.nome.toLowerCase().includes(busca) &&
      (!cat || p.categoria === cat) &&
      (!soBaixo || p.quantidade <= ESTOQUE_BAIXO)
    );

    const tbody = document.querySelector('#tabela-estoque tbody');
    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">Nenhum produto encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(p => {
      const baixo = p.quantidade <= ESTOQUE_BAIXO;
      return `
        <tr>
          <td>${Helpers.esc(p.nome)}</td>
          <td>${Helpers.esc(p.categoria)}</td>
          <td><strong>${p.quantidade}</strong></td>
          <td><span class="badge ${baixo ? 'low' : 'ok'}">${baixo ? 'Baixo' : 'OK'}</span></td>
          <td>${Helpers.formatarMoeda(p.quantidade * p.precoCusto)}</td>
        </tr>
      `;
    }).join('');
  }
};