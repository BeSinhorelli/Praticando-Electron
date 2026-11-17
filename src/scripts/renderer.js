import { Store } from './store.js';
import { Dashboard } from './dashboard.js';
import { Produtos } from './produtos.js';
import { Movimentacoes } from './movimentacoes.js';
import { Estoque } from './estoque.js';

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('page-' + btn.dataset.page).classList.add('active');

      const page = btn.dataset.page;
      if (page === 'dashboard') Dashboard.render();
      if (page === 'estoque') Estoque.render();
      if (page === 'produtos') Produtos.render();
      if (page === 'movimentacoes') Movimentacoes.render();
    });
  });
}

async function init() {
  await Store.carregar();

  Produtos.init();
  Movimentacoes.init();
  Estoque.init();
  setupNavigation();

  Dashboard.render();
  Produtos.render();
  Movimentacoes.render();
  Estoque.render();
}

window.addEventListener('DOMContentLoaded', init);