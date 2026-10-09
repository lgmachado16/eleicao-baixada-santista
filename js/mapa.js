const OPACIDADE = 0.8;
const CLASSES_NATURAIS = 5;
const CLASSES_PRINCIPAIS = 6;

const CAMADAS = [
  { grupo: "Eleição 2026", id: "disputa26", rotulo: "Lula x Flávio", campo: "parte_lula_2026", tipo: "disputa", adversario: "Flávio" },
  { grupo: "Eleição 2026", id: "lula26", rotulo: "Lula", campo: "pct_lula_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "flavio26", rotulo: "Flávio Bolsonaro", campo: "pct_flavio_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "cury26", rotulo: "Augusto Cury", campo: "pct_cury_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "renan26", rotulo: "Renan Santos", campo: "pct_renan_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "caiado26", rotulo: "Caiado", campo: "pct_caiado_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "inv26", rotulo: "Inválidos", campo: "pct_invalidos_2026", tipo: "jenks" },
  { grupo: "Eleição 2026", id: "nc26", rotulo: "Não comparecimento", campo: "pct_nc_2026", tipo: "jenks" },
  { grupo: "Eleição 2022", id: "disputa22", rotulo: "Lula x Bolsonaro", campo: "parte_lula_2022", tipo: "disputa", adversario: "Bolsonaro" },
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

function corDisputa(parteLula) {
  const afastamento = Math.min(0.25, Math.abs(parteLula - 0.5));
  const intensidade = 0.38 + 0.62 * (afastamento / 0.25);
  if (parteLula >= 0.5) return interpolar("#ffffff", "#cc2812", intensidade);
  return interpolar("#ffffff", "#967311", intensidade);
}

function faixasDisputa() {
  const inicios = [0.5, 0.55, 0.6, 0.65, 0.7];
  const lula = [{ vencedor: "lula", inicio: 0.75, fim: 1, cor: "#cc2812", rotulo: "Lula, 75% ou mais" }];
  for (let i = inicios.length - 1; i >= 0; i -= 1) {
    const inicio = inicios[i];
    const fim = Math.round((inicio + 0.05) * 100) / 100;
    lula.push({
      vencedor: "lula",
      inicio,
      fim,
      cor: corDisputa((inicio + fim) / 2),
      rotulo: `Lula, ${Math.round(inicio * 100)}% a ${Math.round(fim * 100)}%`,
    });
  }
  const adversario = inicios.map((inicio) => {
    const fim = Math.round((inicio + 0.05) * 100) / 100;
    return {
      vencedor: "adversario",
      inicio,
      fim,
      cor: corDisputa(1 - (inicio + fim) / 2),
    };
  });
  adversario.push({ vencedor: "adversario", inicio: 0.75, fim: 1, cor: "#967311" });
  return [...lula, ...adversario];
}

function rotuloDisputa(faixa, adversario) {
  const nome = faixa.vencedor === "lula" ? "Lula" : adversario;
  if (faixa.inicio >= 0.75) return `${nome}, 75% ou mais`;
  return `${nome}, ${Math.round(faixa.inicio * 100)}% a ${Math.round(faixa.fim * 100)}%`;
}

function corDaFaixa(parteLula, faixas) {
  const vencedor = parteLula >= 0.5 ? "lula" : "adversario";
  const parcela = vencedor === "lula" ? parteLula : 1 - parteLula;
  const grupo = faixas.filter((faixa) => faixa.vencedor === vencedor);
  const faixa = grupo.find((item) => parcela >= item.inicio && (item.fim === 1 ? parcela <= item.fim : parcela < item.fim));
  return (faixa || grupo.find((item) => item.fim === 1)).cor;
}

const FAIXAS_DISPUTA = faixasDisputa();
CAMADAS.filter((camada) => camada.tipo === "disputa").forEach((camada) => {
  camada.def = { tipo: "disputa" };
  camada.cores = FAIXAS_DISPUTA.map((faixa) => faixa.cor);
});

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

const ESPECTRAL = [
  "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf",
  "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2",
];

function corEspectral(valor, minimo, maximo) {
  const t = maximo === minimo ? 0.5 : (valor - minimo) / (maximo - minimo);
  const posicao = Math.min(1, Math.max(0, t)) * (ESPECTRAL.length - 1);
  const indiceCor = Math.floor(posicao);
  if (indiceCor >= ESPECTRAL.length - 1) return ESPECTRAL[ESPECTRAL.length - 1];
  return interpolar(ESPECTRAL[indiceCor], ESPECTRAL[indiceCor + 1], posicao - indiceCor);
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
  CAMADAS.filter((camada) => !camada.escala && camada.tipo === "jenks").forEach((camada) => prepararCamada(camada, features));
  prepararComparacoes();
}

function prepararCamada(camada, features) {
  const valores = valoresDaCamada(features, camada.campo);
  const quebras = quebrasNaturais(valores, CLASSES_NATURAIS);
  camada.def = { tipo: "jenks", quebras, compartilhada: false };
  camada.cores = coresSequenciais(quebras.length - 1);
}

function prepararComparacoes() {
  const minimo = -0.1;
  const maximo = 0.1;
  CAMADAS.filter((camada) => camada.tipo === "div").forEach((camada) => {
    camada.def = { tipo: "div", min: minimo, max: maximo, compartilhada: true };
    camada.cores = ESPECTRAL.slice();
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
  if (!escala.passo) return null;
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

function estilo(feature, destaque = false) {
  let fillColor = "#d9d9d9";
  if (camadaAtiva.tipo === "disputa") {
    const parte = feature.properties[camadaAtiva.campo];
    if (numeroValido(parte)) fillColor = corDaFaixa(Number(parte), FAIXAS_DISPUTA);
  } else if (camadaAtiva.tipo === "div") {
    const valor = feature.properties[camadaAtiva.campo];
    if (numeroValido(valor)) fillColor = corEspectral(Number(valor), camadaAtiva.def.min, camadaAtiva.def.max);
  } else if (camadaAtiva.cores) {
    const i = indice(feature.properties[camadaAtiva.campo], camadaAtiva);
    if (i !== null) fillColor = camadaAtiva.cores[i];
  }
  return {
    fillColor,
    color: "#1c1917",
    weight: destaque ? 2 : 0,
    opacity: destaque ? 1 : 0,
    stroke: destaque,
    fillOpacity: OPACIDADE,
  };
}

function textoCamada(camada, propriedades) {
  if (camada.tipo === "disputa") {
    const parte = propriedades[camada.campo];
    if (!numeroValido(parte)) return `${camada.rotulo}: sem dado`;
    const numero = Number(parte);
    if (Math.abs(numero - 0.5) < 1e-9) return `${camada.rotulo}: empate na soma`;
    const vencedor = numero > 0.5 ? "Lula" : camada.adversario;
    const parcela = numero > 0.5 ? numero : 1 - numero;
    return `${camada.rotulo}: ${vencedor} com ${formatarPercentual(parcela)} da soma`;
  }
  return `${camada.rotulo}: ${formatarPercentual(propriedades[camada.campo])}`;
}

function popup(feature) {
  const p = feature.properties;
  const linhas = CAMADAS
    .filter((camada) => camada.grupo === camadaAtiva.grupo)
    .map((camada) => {
      const texto = textoCamada(camada, p);
      return camada.id === camadaAtiva.id ? `<strong>${texto}</strong>` : texto;
    })
    .join("<br>");
  return `<strong>${camadaAtiva.grupo}</strong><br>${linhas}<br>${p.nm_mun || "sem município"}<br>Renda mediana: ${formatarRenda(p.renda_mediana)}`;
}

function desenharLegenda() {
  const faixa = document.getElementById("faixa");
  const marcas = document.getElementById("marcas");
  const titulo = document.getElementById("legenda-titulo");
  const nota = document.getElementById("legenda-nota");
  faixa.innerHTML = "";
  faixa.className = "faixa";
  faixa.style.background = "";
  marcas.innerHTML = "";
  marcas.className = "marcas";
  titulo.textContent = `${camadaAtiva.grupo}: ${camadaAtiva.rotulo}`;
  if (!camadaAtiva.cores) {
    nota.textContent = "Cinza é célula sem dado.";
    return;
  }
  if (camadaAtiva.def.tipo === "disputa") {
    const etiquetas = ["75%", "70%", "65%", "60%", "55%", "50%", "50%", "55%", "60%", "65%", "70%", "75%"];
    const adversario = camadaAtiva.adversario;
    FAIXAS_DISPUTA.forEach((item) => {
      const parte = document.createElement("span");
      parte.style.background = item.cor;
      parte.title = rotuloDisputa(item, adversario);
      faixa.appendChild(parte);
    });
    marcas.className = "marcas passos";
    etiquetas.forEach((texto, indice) => {
      const marca = document.createElement("span");
      marca.textContent = texto;
      marca.title = rotuloDisputa(FAIXAS_DISPUTA[indice], adversario);
      marcas.appendChild(marca);
    });
    nota.textContent = `Escala de 5 em 5 pontos até 75% da soma. À esquerda, Lula; à direita, ${adversario}. As cores se encontram no meio. Cinza é célula sem dado.`;
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
  if (camadaAtiva.def.tipo === "div") {
    const escala = camadaAtiva.def;
    faixa.style.background = `linear-gradient(to right, ${ESPECTRAL.join(", ")})`;
    const zero = ((0 - escala.min) / (escala.max - escala.min)) * 100;
    marcas.innerHTML = `<span>${formatarPercentual(escala.min)}</span><span class="zero" style="left:${zero}%">0%</span><span>${formatarPercentual(escala.max)}</span>`;
    nota.textContent = "Mesma escala Spectral, contínua, de −10% a +10%. A cor mais forte vale a partir de 10%, para mais ou para menos. Vermelho é redução e azul é crescimento. Cinza é célula sem dado.";
    return;
  }
}

function aplicarCamada(id) {
  camadaAtiva = CAMADAS.find((item) => item.id === id) || CAMADAS[0];
  if (grade) {
    grade.setStyle((feature) => estilo(feature));
    grade.eachLayer((layer) => {
      if (layer.isTooltipOpen()) layer.setTooltipContent(popup(layer.feature));
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
    dados.features.forEach((feature) => {
      const p = feature.properties;
      const lula26 = Number(p.pct_lula_2026);
      const flavio = Number(p.pct_flavio_2026);
      p.parte_lula_2026 = numeroValido(lula26) && numeroValido(flavio) && lula26 + flavio > 0
        ? lula26 / (lula26 + flavio)
        : null;
      const lula22 = Number(p.pct_lula_2022);
      const bolsonaro = Number(p.pct_bolsonaro_2022);
      p.parte_lula_2022 = numeroValido(lula22) && numeroValido(bolsonaro) && lula22 + bolsonaro > 0
        ? lula22 / (lula22 + bolsonaro)
        : null;
    });
    grade = L.geoJSON(dados, {
      style: estilo,
      onEachFeature(feature, layer) {
        layer.bindTooltip(() => popup(feature), { sticky: true, className: "ficha", opacity: 0.96 });
        layer.on("mouseover", () => {
          layer.setStyle(estilo(feature, true));
          layer.bringToFront();
        });
        layer.on("mouseout", () => {
          layer.setStyle(estilo(feature, false));
        });
      },
    }).addTo(mapa);
    mapa.fitBounds(grade.getBounds(), { padding: [16, 16] });
    desenharLegenda();
  });
