import { Store } from './store.js';
import { Helpers, ESTOQUE_BAIXO } from '../utils/helpers.js';

export const Dashboard = {
  render() {
    const totalProdutos = Store.produtos.length;
    const totalItens = Store.produtos.reduce((s, p) => s + p.quantidade, 0);
    const baixos = Store.produtos.filter(p => p.quantidade <= ESTOQUE_BAIXO);
    const valorCusto = Store.produtos.reduce((s, p) => s + p.quantidade * p.precoCusto, 0);

    const cards = [
      { label: 'Produtos cadastrados', value: totalProdutos, cls: '' },
      { label: 'Itens em estoque', value: totalItens, cls: 'success' },
      { label: 'Estoque baixo', value: baixos.length, cls: 'warning' },
      { label: 'Valor do estoque (custo)', value: Helpers.formatarMoeda(valorCusto), cls: '' }
    ];

    document.getElementById('dashboard-cards').innerHTML = cards.map(c => `
      <div class="card ${c.cls}">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
      </div>
    `).join('');

    const tbody = document.querySelector('#low-stock-table tbody');
    if (baixos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum produto com estoque baixo 🎉</td></tr>';
    } else {
      tbody.innerHTML = baixos.map(p => `
        <tr>
          <td>${Helpers.esc(p.nome)}</td>
          <td>${Helpers.esc(p.categoria)}</td>
          <td><span class="badge low">${p.quantidade}</span></td>
        </tr>
      `).join('');
    }
  }
};