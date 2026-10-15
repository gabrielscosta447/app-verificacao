// Background Canvas com Efeito de Brasas de Fogueira e Poeira Ancestral
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 65;
let mouse = { x: null, y: null, radius: 150 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

class EmberParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    // Começam perto da base ou espalhadas verticalmente
    this.y = Math.random() * canvas.height;
    // Movimento suave para cima (como brasas subindo de uma fogueira)
    this.vy = -(Math.random() * 1.2 + 0.3);
    // Leve oscilação horizontal (como vento em uma caverna ou castelo)
    this.vx = (Math.random() - 0.5) * 0.6;
    this.radius = Math.random() * 2.2 + 0.8;
    
    // Paleta medieval: tons de brasa, ouro velho, faíscas de fogo e cinzas
    const colors = ['#d4af37', '#ff6b00', '#ff2a00', '#a38f68', '#524330'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    this.alpha = Math.random() * 0.7 + 0.2;
    this.decay = Math.random() * 0.005 + 0.002;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.y * 0.01) * 0.3; // Efeito de flutuação no ar

    // Se a brasa subir demais ou sumir, recicla na parte inferior
    if (this.y < -10) {
      this.y = canvas.height + 10;
      this.x = Math.random() * canvas.width;
    }

    // Interatividade suave com o cursor do tocha/mouse (afasta as cinzas)
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2;
        this.y -= (dy / dist) * force * 2;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
    ctx.globalAlpha = 1.0; // Reset global alpha
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new EmberParticle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Lógica de Validação e Pergaminho de Resultado
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vagaForm');
  const inputAltura = document.getElementById('altura');
  const convertMsg = document.getElementById('convert-msg');

  // Elementos do Modal (Pergaminho)
  const modalOverlay = document.getElementById('resultado-modal');
  const modalCard = modalOverlay.querySelector('.modal-card');
  const modalConteudo = document.getElementById('resultado-conteudo');
  const btnCloseX = document.getElementById('btn-close-modal');

  // Conversão Automática de Altura (centímetros para metros)
  function autoConverterAltura() {
    let valor = parseFloat(inputAltura.value);
    if (!isNaN(valor) && valor > 3.0) {
      const emMetros = (valor / 100).toFixed(2);
      inputAltura.value = emMetros;
      convertMsg.textContent = `✨ Feitiço de Medida: ${valor}cm ➔ ${emMetros}m`;
      setTimeout(() => { convertMsg.textContent = ''; }, 4000);
    }
  }

  inputAltura.addEventListener('input', () => {
    if (/^\d{3,}$/.test(inputAltura.value)) {
      autoConverterAltura();
    }
  });

  inputAltura.addEventListener('blur', autoConverterAltura);

  // Fechar Modal
  function fecharModal() {
    modalOverlay.classList.add('hidden');
    modalCard.classList.remove('sucesso', 'erro');
  }

  btnCloseX.addEventListener('click', fecharModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
      fecharModal();
    }
  });

  // Envio do Formulário e Julgamento Real
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    autoConverterAltura();

    const nome = document.getElementById('nome').value.trim();
    const idade = parseInt(document.getElementById('idade').value, 10);
    const altura = parseFloat(inputAltura.value);

    if (!nome || isNaN(idade) || isNaN(altura)) return;

    const atendeIdade = idade >= 18;
    const atendeAltura = altura >= 1.70;
    const isElegivel = atendeIdade && atendeAltura;

    modalCard.classList.remove('sucesso', 'erro');
    modalCard.classList.add(isElegivel ? 'sucesso' : 'erro');

    if (isElegivel) {
      modalConteudo.innerHTML = `
        <span class="pop-status-badge">✔ APROVADO PELO CONSELHO</span>
        <h2 class="pop-title">Decreto Favorável</h2>
        <p class="pop-sub">Valente: <strong>${sanitizarTexto(nome)}</strong></p>

        <div class="pop-message-box">
          Glória! Suas virtudes foram aceitas para a Guarda do Reino!
        </div>

        <div class="req-list">
          <div class="req-item">
            <span>Maioridade (≥ 18 ciclos):</span>
            <strong class="status-pass">✔ ${idade} ciclos</strong>
          </div>
          <div class="req-item">
            <span>Envergadura Mínima (≥ 1.70 m):</span>
            <strong class="status-pass">✔ ${altura.toFixed(2)} m</strong>
          </div>
        </div>

        <button type="button" class="btn-close-pop" id="btn-ok">Aceitar Juramento</button>
      `;
    } else {
      modalConteudo.innerHTML = `
        <span class="pop-status-badge">✖ REJEITADO PELO CONSELHO</span>
        <h2 class="pop-title">Sentença de Inaptidão</h2>
        <p class="pop-sub">Valente: <strong>${sanitizarTexto(nome)}</strong></p>

        <div class="pop-message-box">
          Infelizmente vossas credenciais não cumprem as leis do reino.
        </div>

        <div class="req-list">
          <div class="req-item">
            <span>Maioridade (≥ 18 ciclos):</span>
            <strong class="${atendeIdade ? 'status-pass' : 'status-fail'}">
              ${atendeIdade ? '✔' : '✖'} ${idade} ciclos
            </strong>
          </div>
          <div class="req-item">
            <span>Envergadura Mínima (≥ 1.70 m):</span>
            <strong class="${atendeAltura ? 'status-pass' : 'status-fail'}">
              ${atendeAltura ? '✔' : '✖'} ${altura.toFixed(2)} m
            </strong>
          </div>
        </div>

        <button type="button" class="btn-close-pop" id="btn-ok">Compreendido</button>
      `;
    }

    modalOverlay.classList.remove('hidden');
    document.getElementById('btn-ok').addEventListener('click', fecharModal);
  });

  function sanitizarTexto(texto) {
    const div = document.createElement('div');
    div.innerText = texto;
    return div.innerHTML;
  }
});