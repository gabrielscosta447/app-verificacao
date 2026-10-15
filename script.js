// Background Canvas com Efeito de Campo Estelar / Partículas Dinâmicas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 75;
const maxDistance = 150;
let mouse = { x: null, y: null, radius: 180 };

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

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2.5 + 1;
    this.color = Math.random() > 0.3 ? '#00f3ff' : '#ff0055';
    this.pulse = Math.random() * 0.05;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebate nas bordas
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Interatividade com o cursor do mouse
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 4;
        this.y -= (dy / dist) * force * 4;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Linhas de Conexão entre Partículas
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        const alpha = 1 - dist / maxDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Lógica de Validação e Pop-up
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('vagaForm');
  const inputAltura = document.getElementById('altura');
  const convertMsg = document.getElementById('convert-msg');

  // Elementos do Modal
  const modalOverlay = document.getElementById('resultado-modal');
  const modalCard = modalOverlay.querySelector('.modal-card');
  const modalConteudo = document.getElementById('resultado-conteudo');
  const btnCloseX = document.getElementById('btn-close-modal');

  // Conversão Automática de Altura
  function autoConverterAltura() {
    let valor = parseFloat(inputAltura.value);
    if (!isNaN(valor) && valor > 3.0) {
      const emMetros = (valor / 100).toFixed(2);
      inputAltura.value = emMetros;
      convertMsg.textContent = `⚡ Convertido: ${valor}cm ➔ ${emMetros}m`;
      setTimeout(() => { convertMsg.textContent = ''; }, 3500);
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

  // Envio do Formulário
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
        <span class="pop-status-badge">✔ REQUISITOS ATENDIDOS</span>
        <h2 class="pop-title">Triagem Concluída</h2>
        <p class="pop-sub">Candidato: <strong>${sanitizarTexto(nome)}</strong></p>

        <div class="pop-message-box">
          Parabéns! Você pode prosseguir no processo para a vaga!
        </div>

        <div class="req-list">
          <div class="req-item">
            <span>Maioridade (≥ 18 anos):</span>
            <strong class="status-pass">✔ ${idade} anos</strong>
          </div>
          <div class="req-item">
            <span>Altura Mínima (≥ 1.70 m):</span>
            <strong class="status-pass">✔ ${altura.toFixed(2)} m</strong>
          </div>
        </div>

        <button type="button" class="btn-close-pop" id="btn-ok">Prosseguir</button>
      `;
    } else {
      modalConteudo.innerHTML = `
        <span class="pop-status-badge">✖ INAPTIDÃO DETECTADA</span>
        <h2 class="pop-title">Triagem Concluída</h2>
        <p class="pop-sub">Candidato: <strong>${sanitizarTexto(nome)}</strong></p>

        <div class="pop-message-box">
          Infelizmente você não é apto à vaga.
        </div>

        <div class="req-list">
          <div class="req-item">
            <span>Maioridade (≥ 18 anos):</span>
            <strong class="${atendeIdade ? 'status-pass' : 'status-fail'}">
              ${atendeIdade ? '✔' : '✖'} ${idade} anos
            </strong>
          </div>
          <div class="req-item">
            <span>Altura Mínima (≥ 1.70 m):</span>
            <strong class="${atendeAltura ? 'status-pass' : 'status-fail'}">
              ${atendeAltura ? '✔' : '✖'} ${altura.toFixed(2)} m
            </strong>
          </div>
        </div>

        <button type="button" class="btn-close-pop" id="btn-ok">Entendido</button>
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