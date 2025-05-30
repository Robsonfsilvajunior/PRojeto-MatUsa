const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let ferramenta = 'line';
let pontos = [];
let desenhos = [];
let corSelecionada = 'rgb(0, 0, 0)';

function Cores(str) {
    return str;
}

function setTool(tool) {
  ferramenta = tool;
  pontos = [];
}

function getCor() {
  return ferramenta === 'borracha' ? 'rgb(255, 255, 255)' : corSelecionada;
}

function getEspessura() {
  return parseInt(document.getElementById('espessura').value);
}

function getTracejado() {
  const val = document.getElementById('tracejado').value;
  return val === 'solid' ? [] : val.split(',').map(Number);
}

function pintap(x, y, cor) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, 1, 1);
}

function bresenham(x0, y0, x1, y1, cor, espessura, tracejado) {
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  let dashIndex = 0;
  let dashOffset = 0;
  let draw = true;

  let dashPattern = tracejado.length > 0 ? tracejado : [Infinity];

  ctx.strokeStyle = cor;
  ctx.lineWidth = espessura;

  while (true) {
    if (draw) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 1, y0);
      ctx.stroke();
    }

    dashOffset++;
    if (dashOffset >= dashPattern[dashIndex]) {
      dashOffset = 0;
      draw = !draw;
      dashIndex = (dashIndex + 1) % dashPattern.length;
    }

    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function desenharFigura(pts, cor, espessura = 1, tracejado = []) {
  ctx.strokeStyle = cor;
  ctx.lineWidth = espessura;
  ctx.setLineDash(tracejado);

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineWidth = 1;
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  pontos.push([x, y]);

  let cor = getCor();
  let desenhar = false;
  let forma = [];

  switch (ferramenta) {
    case 'line':
    case 'borracha':
      if (pontos.length === 2) {
        let [p1, p2] = pontos;
        bresenham(p1[0], p1[1], p2[0], p2[1], cor, getEspessura(), getTracejado());
        desenhos.push({
          tipo: ferramenta,
          pontos: pontos.slice(),
          cor: cor,
          espessura: getEspessura(),
          tracejado: getTracejado()
        });
        pontos = [];
      }
      break;

    case 'retangulo':
      if (pontos.length === 2) {
        let [p1, p2] = pontos;
        forma = [
          [p1[0], p1[1]],
          [p2[0], p1[1]],
          [p2[0], p2[1]],
          [p1[0], p2[1]]
        ];
        desenhar = true;
      }
      break;

    case 'triangulo':
      if (pontos.length === 3) {
        forma = pontos.slice();
        desenhar = true;
      }
      break;

    case 'losango':
      if (pontos.length === 4) {
        forma = pontos.slice();
        desenhar = true;
      }
      break;

    case 'pentagono':
      if (pontos.length === 5) {
        forma = pontos.slice();
        desenhar = true;
      }
      break;
  }

  if (desenhar) {
    desenharFigura(forma, cor, getEspessura(), getTracejado());
    desenhos.push({
      tipo: ferramenta,
      pontos: forma,
      cor: cor,
      espessura: getEspessura(),
      tracejado: getTracejado()
    });
    pontos = [];
  }
});

function salvarArquivo() {
  const conteudo = JSON.stringify(desenhos);
  const blob = new Blob([conteudo], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dados.json';
  a.click();
}

function carregarArquivo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      desenhos = JSON.parse(event.target.result);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      desenhos.forEach(obj => {
        if (obj.tipo === 'line' || obj.tipo === 'borracha') {
          let [p1, p2] = obj.pontos;
          bresenham(p1[0], p1[1], p2[0], p2[1], obj.cor, obj.espessura, obj.tracejado);
        } else {
          desenharFigura(obj.pontos, obj.cor, obj.espessura, obj.tracejado);
        }
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

function limparTela() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenhos = [];
}

document.addEventListener('DOMContentLoaded', () => {
  // Definindo as cores em RGB
  const cores = [
    { nome: 'Preto', valor: 'rgb(0, 0, 0)' },
    { nome: 'Branco', valor: 'rgb(255, 255, 255)' },
    { nome: 'Cinza', valor: 'rgb(128, 128, 128)' },
    { nome: 'Vermelho', valor: 'rgb(255, 0, 0)' },
    { nome: 'Laranja', valor: 'rgb(255, 165, 0)' },
    { nome: 'Amarelo', valor: 'rgb(255, 255, 0)' },
    { nome: 'Verde', valor: 'rgb(0, 128, 0)' },
    { nome: 'Ciano', valor: 'rgb(0, 255, 255)' },
    { nome: 'Azul', valor: 'rgb(0, 0, 255)' },
    { nome: 'Roxo', valor: 'rgb(128, 0, 128)' }
  ];

  const coresDiv = document.getElementById('cores');
  coresDiv.innerHTML = ''; // Limpa as cores existentes

  cores.forEach(cor => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = cor.valor;
    swatch.setAttribute('data-color', cor.valor);
    swatch.title = cor.nome;
    coresDiv.appendChild(swatch);
  });

  document.querySelectorAll('.color-swatch').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      corSelecionada = Cores(el.getAttribute('data-color'));
    });
  });
  
  // Seleciona a cor preta por padrão
  document.querySelector('.color-swatch[data-color="rgb(0, 0, 0)"]').classList.add('selected');
}); 