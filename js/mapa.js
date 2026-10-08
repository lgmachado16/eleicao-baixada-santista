const ESCALAS = {
  candidatos: { min: 0, max: 0.75, passo: 0.05, tipo: "seq" },
  menores: { min: 0, max: 0.12, passo: 0.02, tipo: "seq" },
  invalidos: { min: 0, max: 0.1, passo: 0.02, tipo: "seq" },
  comparecimento: { min: 0, max: 0.4, passo: 0.02, tipo: "seq" },
  difCandidatos: { min: -0.4, max: 0.4, passo: 0.05, tipo: "div" },
  difInvalidos: { min: -0.06, max: 0.06, passo: 0.02, tipo: "div" },
  difComparecimento: { min: -0.74, max: 2.14, passo: 0.02, tipo: "div" },
};

const CAMADAS = [
  { grupo: "Eleição 2026", id: "lula26", rotulo: "Lula", campo: "pct_lula_2026", escala: "candidatos" },
  { grupo: "Eleição 2026", id: "flavio26", rotulo: "Flávio Bolsonaro", campo: "pct_flavio_2026", escala: "candidatos" },
  { grupo: "Eleição 2026", id: "cury26", rotulo: "Augusto Cury", campo: "pct_cury_2026", escala: "menores" },
  { grupo: "Eleição 2026", id: "renan26", rotulo: "Renan Santos", campo: "pct_renan_2026", escala: "menores" },
  { grupo: "Eleição 2026", id: "caiado26", rotulo: "Caiado", campo: "pct_caiado_2026", escala: "menores" },
  { grupo: "Eleição 2026", id: "inv26", rotulo: "Inválidos", campo: "pct_invalidos_2026", escala: "invalidos" },
  { grupo: "Eleição 2026", id: "nc26", rotulo: "Não comparecimento", campo: "pct_nc_2026", escala: "comparecimento" },
  { grupo: "Eleição 2022", id: "lula22", rotulo: "Lula", campo: "pct_lula_2022", escala: "candidatos" },
  { grupo: "Eleição 2022", id: "bolsonaro22", rotulo: "Bolsonaro", campo: "pct_bolsonaro_2022", escala: "candidatos" },
  { grupo: "Eleição 2022", id: "tebet22", rotulo: "Tebet", campo: "pct_tebet_2022", escala: "menores" },
  { grupo: "Eleição 2022", id: "ciro22", rotulo: "Ciro", campo: "pct_ciro_2022", escala: "menores" },
  { grupo: "Eleição 2022", id: "inv22", rotulo: "Inválidos", campo: "pct_invalidos_2022", escala: "invalidos" },
  { grupo: "Eleição 2022", id: "nc22", rotulo: "Não comparecimento", campo: "pct_nc_2022", escala: "comparecimento" },
  { grupo: "Comparação 2026x2022", id: "difLula", rotulo: "Lula", campo: "dif_pct_lula", escala: "difCandidatos" },
  { grupo: "Comparação 2026x2022", id: "difBolsonaro", rotulo: "Bolsonaro / Flávio", campo: "dif_pct_bolsonaro", escala: "difCandidatos" },
  { grupo: "Comparação 2026x2022", id: "difInv", rotulo: "Inválidos", campo: "dif_pct_invalidos", escala: "difInvalidos" },
  { grupo: "Comparação 2026x2022", id: "difNc", rotulo: "Não comparecimento", campo: "dif_pct_nc", escala: "difComparecimento" },
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
  return rgbParaHex(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  );
}

function nClasses(escala) {
  return Math.round((escala.max - escala.min) / escala.passo);
}

function coresDaEscala(escala) {
  const n = nClasses(escala);
  if (escala.tipo === "seq") {
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 1 : i / (n - 1);
      if (t < 0.5) return interpolar("#ffffcc", "#fd8d3c", t / 0.5);
      return interpolar("#fd8d3c", "#800026", (t - 0.5) / 0.5);
    });
  }
  const meio = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => {
    if (i <= meio) return interpolar("#2166ac", "#f7f7f7", meio === 0 ? 1 : i / meio);
    return interpolar("#f7f7f7", "#b2182b", (i - meio) / (n - 1 - meio));
  });
}

CAMADAS.forEach((camada) => {
  camada.def = ESCALAS[camada.escala];
  camada.cores = coresDaEscala(camada.def);
});

function indice(valor, escala) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return null;
  const n = nClasses(escala);
  const limitado = Math.min(escala.max - escala.passo / 1000, Math.max(escala.min, Number(valor)));
  return Math.max(0, Math.min(n - 1, Math.floor((limitado - escala.min) / escala.passo)));
}

function formatarPercentual(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return "sem dado";
  return `${(Number(valor) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatarRenda(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return "sem dado";
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
  const i = indice(feature.properties[camadaAtiva.campo], camadaAtiva.def);
  return {
    fillColor: i === null ? "#d9d9d9" : camadaAtiva.cores[i],
    color: "#57534e",
    weight: 0.4,
    fillOpacity: 0.88,
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
  faixa.innerHTML = "";
  camadaAtiva.cores.forEach((cor) => {
    const parte = document.createElement("span");
    parte.style.background = cor;
    faixa.appendChild(parte);
  });
  const escala = camadaAtiva.def;
  const rotulos = [escala.min, (escala.min + escala.max) / 2, escala.max].map((valor) => formatarPercentual(valor));
  marcas.innerHTML = rotulos.map((texto) => `<span>${texto}</span>`).join("");
  const passo = Math.round(escala.passo * 100);
  titulo.textContent = `${camadaAtiva.grupo}: ${camadaAtiva.rotulo} (${passo} em ${passo})`;
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
    grade = L.geoJSON(dados, {
      style: estilo,
      onEachFeature(feature, layer) {
        layer.bindPopup(() => popup(feature));
      },
    }).addTo(mapa);
    mapa.fitBounds(grade.getBounds(), { padding: [16, 16] });
  });
