const Helpers = {
  gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  formatarMoeda(v) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  formatarData(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  toast(msg, tipo = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + tipo;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.className = 'toast ' + tipo, 2800);
  },

  ESTOQUE_BAIXO: 5  // limite para "estoque baixo"
};