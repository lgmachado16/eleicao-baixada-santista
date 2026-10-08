const OPACIDADE = 0.4;
const CLASSES_NATURAIS = 5;
const CLASSES_PRINCIPAIS = 6;

const CAMADAS = [
  { grupo: "Eleição 2026", id: "lula26", rotulo: "Lula", campo: "pct_lula_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "flavio26", rotulo: "Flávio Bolsonaro", campo: "pct_flavio_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "cury26", rotulo: "Augusto Cury", campo: "pct_cury_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "renan26", rotulo: "Renan Santos", campo: "pct_renan_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "caiado26", rotulo: "Caiado", campo: "pct_caiado_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "inv26", rotulo: "Inválidos", campo: "pct_invalidos_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "nc26", rotulo: "Não comparecimento", campo: "pct_nc_2026", tipo: "jenks" },
  { grupo: "Eleição 2022", id: "lula22", rotulo: "Lula", campo: "pct_lula_2022", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2022", id: "bolsonaro22", rotulo: "Bolsonaro", campo: "pct_bolsonaro_2022", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2022", id: "tebet22", rotulo: "Tebet", campo: "pct_tebet_2022", tipo: "jenks" },
  { grupo: "Eleição 2022", id: "ciro22", rotulo: "Ciro", campo: "pct_ciro_2022", tipo: "jenks" },
  { grupo: "Eleição 2022", id: "inv22", rotulo: "Inválidos", campo: "pct_invalidos_2022", tipo: "jenks" },
  { grupo: "Eleição 2022", id: "nc22", rotulo: "Não comparecimento", campo: "pct_nc_2022", tipo: "jenks" },
  { grupo: "Comparação 2026x2022", id: "difLula", rotulo: "Lula", campo: "dif_pct_lula", tipo: "div" },
  { grupo: "Comparação 2026x2022", id: "difBolsonaro", rotulo: "Bolsonaro / Flávio", campo: "dif_pct_bolsonaro", tipo: "div" },
  { grupo: "Comparação 2026x2022", id: "difInv", rotulo: "Inválidos", campo: "dif_pct_invalidos", tipo: "div" },
  { grupo: "Comparação 2026x2022", id: "difNc", rotulo: "Não comparecimento", campo: "dif_pct_nc", tipo: "div" },
];

function hexParaRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbParaHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function interpolar(origem, destino, t) {
  const a = hexParaRgb(origem);
  const b = hexParaRgb(destino);
  const peso = Math.min(1, Math.max(0, t));
  return rgbParaHex(
    a[0] + (b[0] - a[0]) * peso,
    a[1] + (b[1] - a[1]) * peso,
    a[2] + (b[2] - a[2]) * peso,
  );
}

function numeroValido(valor) {
  return valor !== null && valor !== undefined && Number.isFinite(Number(valor));
}

function valoresDaCamada(features, campo) {
  return features
    .map((feature) => feature.properties[campo])
    .filter(numeroValido)
    .map(Number);
}

function quebrasNaturais(valores, classes) {
  const dados = valores.slice().sort((a, b) => a - b);
  const distintos = new Set(dados).size;
  const k = Math.max(1, Math.min(classes, distintos));
  if (dados.length === 0) return [0, 1];
  if (k === 1) return [dados[0], dados[dados.length - 1]];

  const n = dados.length;
  const limite = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  const variancia = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  for (let i = 1; i <= k; i += 1) {
    limite[1][i] = 1;
    variancia[1][i] = 0;
    for (let j = 2; j <= n; j += 1) variancia[j][i] = Infinity;
  }
  for (let l = 2; l <= n; l += 1) {
    let soma = 0;
    let somaQuadrados = 0;
    let peso = 0;
    for (let m = 1; m <= l; m += 1) {
      const inicio = l - m + 1;
      const valor = dados[inicio - 1];
      peso += 1;
      soma += valor;
      somaQuadrados += valor * valor;
      const dispersao = somaQuadrados - (soma * soma) / peso;
      const anterior = inicio - 1;
      if (anterior !== 0) {
        for (let j = 2; j <= k; j += 1) {
          const candidata = dispersao + variancia[anterior][j - 1];
          if (variancia[l][j] >= candidata) {
            limite[l][j] = inicio;
            variancia[l][j] = candidata;
          }
        }
      }
    }
    limite[l][1] = 1;
    variancia[l][1] = somaQuadrados - (soma * soma) / peso;
  }

  const quebras = Array(k + 1).fill(0);
  quebras[k] = dados[n - 1];
  quebras[0] = dados[0];
  let indiceFinal = n - 1;
  for (let classe = k; classe > 1; classe -= 1) {
    const inicio = limite[indiceFinal][classe];
    quebras[classe - 1] = dados[inicio - 2];
    indiceFinal = inicio - 1;
  }
  return quebras;
}

function coresSequenciais(quantidade) {
  return Array.from({ length: quantidade }, (_, i) => {
    const t = quantidade === 1 ? 1 : i / (quantidade - 1);
    if (t < 0.5) return interpolar("#ffffcc", "#fd8d3c", t / 0.5);
    return interpolar("#fd8d3c", "#800026", (t - 0.5) / 0.5);
  });
}

function percentil(valores, fracao) {
  const dados = valores.slice().sort((a, b) => a - b);
  const posicao = (dados.length - 1) * fracao;
  const abaixo = Math.floor(posicao);
  const acima = Math.ceil(posicao);
  if (abaixo === acima) return dados[abaixo];
  return dados[abaixo] + (dados[acima] - dados[abaixo]) * (posicao - abaixo);
}

function corDivergente(valor, minimo, maximo) {
  if (valor < 0) {
    const t = minimo === 0 ? 0 : valor / minimo;
    return interpolar("#f7f7f7", "#b2182b", t);
  }
  if (valor > 0) {
    const t = maximo === 0 ? 0 : valor / maximo;
    return interpolar("#f7f7f7", "#2166ac", t);
  }
  return "#f7f7f7";
}

function prepararCamadas(features) {
  const grupos = new Map();
  CAMADAS.filter((camada) => camada.escala).forEach((camada) => {
    const lista = grupos.get(camada.escala) || [];
    lista.push(...valoresDaCamada(features, camada.campo));
    grupos.set(camada.escala, lista);
  });
  grupos.forEach((valores, nome) => {
    const classes = nome === "principais" ? CLASSES_PRINCIPAIS : CLASSES_NATURAIS;
    const quebras = quebrasNaturais(valores, classes);
    const cores = coresSequenciais(quebras.length - 1);
    CAMADAS.filter((camada) => camada.escala === nome).forEach((camada) => {
      camada.def = { tipo: "jenks", quebras, compartilhada: true };
      camada.cores = cores;
    });
  });
  CAMADAS.filter((camada) => !camada.escala).forEach((camada) => prepararCamada(camada, features));
}

function prepararCamada(camada, features) {
  const valores = valoresDaCamada(features, camada.campo);
  if (camada.tipo === "jenks") {
    const quebras = quebrasNaturais(valores, CLASSES_NATURAIS);
    camada.def = { tipo: "jenks", quebras, compartilhada: false };
    camada.cores = coresSequenciais(quebras.length - 1);
    return;
  }
  let minimo = Math.floor(Math.min(...valores) * 100 + 1e-6) / 100;
  let maximo = Math.ceil(Math.max(...valores) * 100 - 1e-6) / 100;
  if (minimo > 0) minimo = 0;
  if (maximo < 0) maximo = 0;
  if (minimo === maximo) maximo = minimo + 0.01;
  const passo = 0.01;
  const quantidade = Math.round((maximo - minimo) / passo);
  const perdaPlena = Math.min(percentil(valores, 0.05), -passo);
  const ganhoPleno = Math.max(percentil(valores, 0.95), passo);
  camada.def = { tipo: "div", min: minimo, max: maximo, passo, perdaPlena, ganhoPleno };
  camada.cores = Array.from({ length: quantidade }, (_, i) => {
    const meio = minimo + (i + 0.5) * passo;
    return corDivergente(meio, perdaPlena, ganhoPleno);
  });
}

function indice(valor, camada) {
  if (!numeroValido(valor)) return null;
  const numero = Number(valor);
  if (camada.def.tipo === "jenks") {
    const quebras = camada.def.quebras;
    const ultima = quebras.length - 2;
    for (let i = 0; i < ultima; i += 1) {
      if (numero <= quebras[i + 1]) return i;
    }
    return ultima;
  }
  const escala = camada.def;
  const limitado = Math.min(escala.max - escala.passo / 2, Math.max(escala.min, numero));
  const posicao = Math.floor((limitado - escala.min) / escala.passo);
  return Math.max(0, Math.min(camada.cores.length - 1, posicao));
}

function formatarPercentual(valor) {
  if (!numeroValido(valor)) return "sem dado";
  return `${(Number(valor) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatarRenda(valor) {
  if (!numeroValido(valor)) return "sem dado";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const mapa = L.map("mapa");
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri",
  maxZoom: 16,
}).addTo(mapa);

let camadaAtiva = CAMADAS[0];
let grade;

function estilo(feature) {
  const i = camadaAtiva.cores ? indice(feature.properties[camadaAtiva.campo], camadaAtiva) : null;
  return {
    fillColor: i === null ? "#d9d9d9" : camadaAtiva.cores[i],
    stroke: false,
    weight: 0,
    fillOpacity: OPACIDADE,
  };
}

function popup(feature) {
  const p = feature.properties;
  const valor = p[camadaAtiva.campo];
  return `<strong>${camadaAtiva.rotulo}</strong><br>${formatarPercentual(valor)}<br>${p.nm_mun || "sem município"}<br>Renda mediana: ${formatarRenda(p.renda_mediana)}`;
}

function desenharLegenda() {
  const faixa = document.getElementById("faixa");
  const marcas = document.getElementById("marcas");
  const titulo = document.getElementById("legenda-titulo");
  const nota = document.getElementById("legenda-nota");
  faixa.innerHTML = "";
  faixa.className = "faixa";
  marcas.innerHTML = "";
  titulo.textContent = `${camadaAtiva.grupo}: ${camadaAtiva.rotulo}`;
  if (!camadaAtiva.cores) {
    nota.textContent = "Cinza é célula sem dado.";
    return;
  }
  if (camadaAtiva.def.tipo === "jenks") {
    faixa.classList.add("lista");
    const quebras = camadaAtiva.def.quebras;
    camadaAtiva.cores.forEach((cor, i) => {
      const item = document.createElement("div");
      item.className = "classe";
      item.innerHTML = `<i style="background:${cor}"></i><span>${formatarPercentual(quebras[i])} a ${formatarPercentual(quebras[i + 1])}</span>`;
      faixa.appendChild(item);
    });
    nota.textContent = camadaAtiva.def.compartilhada
      ? "Mesma escala de Lula e Bolsonaro, nos dois anos. Cinza é célula sem dado."
      : "Quebras naturais desta camada. Cinza é célula sem dado.";
    return;
  }
  camadaAtiva.cores.forEach((cor) => {
    const parte = document.createElement("span");
    parte.style.background = cor;
    faixa.appendChild(parte);
  });
  const escala = camadaAtiva.def;
  const zero = ((0 - escala.min) / (escala.max - escala.min)) * 100;
  marcas.innerHTML = `<span>${formatarPercentual(escala.min)}</span><span class="zero" style="left:${zero}%">0%</span><span>${formatarPercentual(escala.max)}</span>`;
  nota.textContent = "Classes de 1 em 1 ponto. Vermelho é perda e azul é ganho. Cinza é célula sem dado.";
}

function aplicarCamada(id) {
  camadaAtiva = CAMADAS.find((item) => item.id === id) || CAMADAS[0];
  if (grade) {
    grade.setStyle(estilo);
    grade.eachLayer((layer) => {
      if (layer.isPopupOpen()) layer.setPopupContent(popup(layer.feature));
    });
  }
  desenharLegenda();
}

function montarPainel() {
  const painel = document.getElementById("grupos");
  const grupos = [...new Set(CAMADAS.map((item) => item.grupo))];
  grupos.forEach((nome) => {
    const bloco = document.createElement("section");
    bloco.className = "grupo";
    bloco.innerHTML = `<h2>${nome}</h2>`;
    CAMADAS.filter((item) => item.grupo === nome).forEach((item) => {
      const rotulo = document.createElement("label");
      rotulo.className = "opcao";
      rotulo.innerHTML = `<input type="radio" name="camada" value="${item.id}"> <span>${item.rotulo}</span>`;
      bloco.appendChild(rotulo);
    });
    painel.appendChild(bloco);
  });
  painel.addEventListener("change", (evento) => {
    if (evento.target.name === "camada") aplicarCamada(evento.target.value);
  });
  painel.querySelector("input").checked = true;
}

montarPainel();
desenharLegenda();

fetch("dados/grade.geojson")
  .then((resposta) => resposta.json())
  .then((dados) => {
    prepararCamadas(dados.features);
    grade = L.geoJSON(dados, {
      style: estilo,
      onEachFeature(feature, layer) {
        layer.bindPopup(() => popup(feature));
      },
    }).addTo(mapa);
    mapa.fitBounds(grade.getBounds(), { padding: [16, 16] });
    desenharLegenda();
  });
