const OPACIDADE = 0.8;
const CLASSES_NATURAIS = 5;
const CLASSES_PRINCIPAIS = 6;
const CLASSES_DEZ = 10;

const CAMADAS = [
  { grupo: "Eleição 2026", id: "disputa26", rotulo: "Lula x Flávio", campo: "parte_lula_2026", tipo: "disputa", adversario: "Flávio" },
  { grupo: "Eleição 2026", id: "lula26", rotulo: "Lula", campo: "pct_lula_2026", campoAbsoluto: "votos_lula_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "flavio26", rotulo: "Flávio Bolsonaro", campo: "pct_flavio_2026", campoAbsoluto: "votos_flavio_2026", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2026", id: "cury26", rotulo: "Augusto Cury", campo: "pct_cury_2026", campoAbsoluto: "votos_cury_2026", tipo: "jenks", escala: "demais" },
  { grupo: "Eleição 2026", id: "renan26", rotulo: "Renan Santos", campo: "pct_renan_2026", campoAbsoluto: "votos_renan_2026", tipo: "jenks", escala: "demais" },
  { grupo: "Eleição 2026", id: "caiado26", rotulo: "Caiado", campo: "pct_caiado_2026", campoAbsoluto: "votos_caiado_2026", tipo: "jenks", escala: "demais" },
  { grupo: "Eleição 2026", id: "inv26", rotulo: "Inválidos", campo: "pct_invalidos_2026", campoAbsoluto: "votos_invalidos_2026", tipo: "jenks", escala: "invalidos" },
  { grupo: "Eleição 2026", id: "nc26", rotulo: "Não comparecimento", campo: "pct_nc_2026", campoAbsoluto: "votos_nc_2026", tipo: "jenks", escala: "comparecimento" },
  { grupo: "Eleição 2022", id: "disputa22", rotulo: "Lula x Bolsonaro", campo: "parte_lula_2022", tipo: "disputa", adversario: "Bolsonaro" },
  { grupo: "Eleição 2022", id: "lula22", rotulo: "Lula", campo: "pct_lula_2022", campoAbsoluto: "votos_lula_2022", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2022", id: "bolsonaro22", rotulo: "Bolsonaro", campo: "pct_bolsonaro_2022", campoAbsoluto: "votos_bolsonaro_2022", tipo: "jenks", escala: "principais" },
  { grupo: "Eleição 2022", id: "tebet22", rotulo: "Tebet", campo: "pct_tebet_2022", campoAbsoluto: "votos_tebet_2022", tipo: "jenks", escala: "demais" },
  { grupo: "Eleição 2022", id: "ciro22", rotulo: "Ciro", campo: "pct_ciro_2022", campoAbsoluto: "votos_ciro_2022", tipo: "jenks", escala: "demais" },
  { grupo: "Eleição 2022", id: "inv22", rotulo: "Inválidos", campo: "pct_invalidos_2022", campoAbsoluto: "votos_invalidos_2022", tipo: "jenks", escala: "invalidos" },
  { grupo: "Eleição 2022", id: "nc22", rotulo: "Não comparecimento", campo: "pct_nc_2022", campoAbsoluto: "votos_nc_2022", tipo: "jenks", escala: "comparecimento" },
  { grupo: "Comparação 2026x2022", id: "difLula", rotulo: "Lula", campo: "dif_pct_lula", campoAbsoluto: "dif_lula", tipo: "div", escalaDif: "difPrincipais" },
  { grupo: "Comparação 2026x2022", id: "difBolsonaro", rotulo: "Bolsonaro / Flávio", campo: "dif_pct_bolsonaro", campoAbsoluto: "dif_bolsonaro", tipo: "div", escalaDif: "difPrincipais" },
  { grupo: "Comparação 2026x2022", id: "difInv", rotulo: "Inválidos", campo: "dif_pct_invalidos", campoAbsoluto: "dif_invalidos", tipo: "div", escalaDif: "difInvalidos" },
  { grupo: "Comparação 2026x2022", id: "difNc", rotulo: "Não comparecimento", campo: "dif_pct_nc", campoAbsoluto: "dif_nc", tipo: "div", escalaDif: "difComparecimento" },
  { grupo: "Rendimento", id: "renda", rotulo: "Nominal mediano", campo: "renda_mediana", tipo: "reais" },
  { grupo: "Vulnerabilidade", id: "ipvs", rotulo: "IPVS", campo: "ipvs", tipo: "estrato" },
];

const ESTRATOS_IPVS = [
  { valor: 1, cor: "#1a9850", rotulo: "Baixíssima vulnerabilidade" },
  { valor: 2, cor: "#91cf60", rotulo: "Muito baixa vulnerabilidade" },
  { valor: 3, cor: "#d9ef8b", rotulo: "Baixa vulnerabilidade" },
  { valor: 4, cor: "#fee08b", rotulo: "Média vulnerabilidade" },
  { valor: 5, cor: "#fc8d59", rotulo: "Alta vulnerabilidade" },
  { valor: 6, cor: "#d73027", rotulo: "Muito alta vulnerabilidade" },
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

function valoresDaCamada(features, campo, campoBase) {
  return features
    .map((feature) => {
      if (campoBase && !numeroValido(feature.properties[campoBase])) return null;
      return feature.properties[campo];
    })
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

function corSequencialContinua(valor, minimo, maximo) {
  const t = maximo === minimo ? 1 : Math.min(1, Math.max(0, (valor - minimo) / (maximo - minimo)));
  if (t < 0.5) return interpolar("#ffffcc", "#fd8d3c", t / 0.5);
  return interpolar("#fd8d3c", "#800026", (t - 0.5) / 0.5);
}

function coresSequenciais(quantidade) {
  return Array.from({ length: quantidade }, (_, i) => {
    const t = quantidade === 1 ? 1 : i / (quantidade - 1);
    return corSequencialContinua(t, 0, 1);
  });
}

function corIpvs(valor) {
  const ultimo = ESTRATOS_IPVS.length - 1;
  const posicao = Math.min(ultimo, Math.max(0, Number(valor) - 1));
  const indiceCor = Math.floor(posicao);
  if (indiceCor >= ultimo) return ESTRATOS_IPVS[ultimo].cor;
  return interpolar(ESTRATOS_IPVS[indiceCor].cor, ESTRATOS_IPVS[indiceCor + 1].cor, posicao - indiceCor);
}

function gradiente(cores) {
  return `linear-gradient(to right, ${cores.join(", ")})`;
}

function amostras(quantidade, corEm) {
  return Array.from({ length: quantidade }, (_, i) => corEm(i / (quantidade - 1)));
}

const ESPECTRAL = [
  "#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf",
  "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142",
];

function corEspectral(valor, minimo, maximo) {
  const t = maximo === minimo ? 0.5 : (valor - minimo) / (maximo - minimo);
  const posicao = Math.min(1, Math.max(0, t)) * (ESPECTRAL.length - 1);
  const indiceCor = Math.floor(posicao);
  if (indiceCor >= ESPECTRAL.length - 1) return ESPECTRAL[ESPECTRAL.length - 1];
  return interpolar(ESPECTRAL[indiceCor], ESPECTRAL[indiceCor + 1], posicao - indiceCor);
}

function prepararEscalas(features, campoDe, destino) {
  const grupos = new Map();
  CAMADAS.filter((camada) => camada.escala && campoDe(camada)).forEach((camada) => {
    const chave = chaveDaEscala(camada);
    const lista = grupos.get(chave) || [];
    lista.push(...valoresDaCamada(features, campoDe(camada), camada.campo));
    grupos.set(chave, lista);
  });
  grupos.forEach((valores, chave) => {
    const amostra = CAMADAS.find((camada) => camada.escala && chaveDaEscala(camada) === chave);
    const nome = amostra.escala;
    const classes = nome === "principais"
      ? CLASSES_PRINCIPAIS
      : (nome === "demais" || nome === "invalidos" || nome === "comparecimento")
        ? CLASSES_DEZ
        : CLASSES_NATURAIS;
    const quebras = quebrasNaturais(valores, classes);
    const cores = coresSequenciais(quebras.length - 1);
    CAMADAS.filter((camada) => camada.escala && chaveDaEscala(camada) === chave).forEach((camada) => {
      camada[destino.def] = { tipo: "jenks", quebras, compartilhada: nome !== "demais" };
      camada[destino.cores] = cores;
    });
  });
  CAMADAS.filter((camada) => !camada.escala && camada.tipo === "jenks" && campoDe(camada)).forEach((camada) => {
    const valores = valoresDaCamada(features, campoDe(camada), camada.campo);
    const quebras = quebrasNaturais(valores, CLASSES_NATURAIS);
    camada[destino.def] = { tipo: "jenks", quebras, compartilhada: false };
    camada[destino.cores] = coresSequenciais(quebras.length - 1);
  });
}

function candidatoPercentual(camada) {
  return camada.tipo === "jenks" && camada.escala !== "invalidos" && camada.escala !== "comparecimento";
}

function quebrasDeCinco(valores) {
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const inicio = Math.floor((minimo + 1e-9) * 20) / 20;
  let fim = Math.ceil((maximo - 1e-9) * 20) / 20;
  if (fim <= inicio) fim = Math.round((inicio + 0.05) * 1000) / 1000;
  const quebras = [];
  for (let valor = inicio; valor < fim - 1e-9; valor = Math.round((valor + 0.05) * 1000) / 1000) {
    quebras.push(Math.round(valor * 1000) / 1000);
  }
  quebras.push(Math.round(fim * 1000) / 1000);
  return quebras;
}

function quebrasDeUmEMeio(valores) {
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const passo = 0.015;
  const teto = 0.15;
  const arredondar = (valor) => Math.round(valor * 1000) / 1000;
  const inicio = arredondar(Math.max(0, Math.floor((minimo + 1e-9) / passo) * passo));
  const fimObservado = Math.ceil((maximo - 1e-9) / passo) * passo;
  let fimFino = arredondar(Math.min(teto, Math.max(inicio + passo, fimObservado)));
  if (fimFino <= inicio) fimFino = arredondar(inicio + passo);
  const quebras = [];
  for (let valor = inicio; valor < fimFino - 1e-9; valor = arredondar(valor + passo)) {
    quebras.push(arredondar(valor));
  }
  quebras.push(fimFino);
  if (maximo > teto + 1e-9) {
    const fim = arredondar(Math.ceil((maximo - 1e-9) / 0.05) * 0.05);
    for (let valor = arredondar(teto + 0.05); valor < fim - 1e-9; valor = arredondar(valor + 0.05)) {
      quebras.push(valor);
    }
    quebras.push(fim);
  }
  return quebras;
}

function chaveDaEscala(camada) {
  if (camada.escala === "demais") return camada.id;
  return camada.escala || camada.id;
}

function prepararCinco(features) {
  const grupos = new Map();
  CAMADAS.filter((camada) => candidatoPercentual(camada) && camada.escala === "principais").forEach((camada) => {
    const chave = chaveDaEscala(camada);
    const lista = grupos.get(chave) || [];
    lista.push(...valoresDaCamada(features, camada.campo, camada.campo));
    grupos.set(chave, lista);
  });
  grupos.forEach((valores, chave) => {
    const dono = CAMADAS.find((camada) => candidatoPercentual(camada) && chaveDaEscala(camada) === chave);
    const fino = dono && dono.escala === "demais";
    const quebras = fino ? quebrasDeUmEMeio(valores) : quebrasDeCinco(valores);
    const cores = coresSequenciais(quebras.length - 1);
    CAMADAS.filter((camada) => candidatoPercentual(camada) && chaveDaEscala(camada) === chave).forEach((camada) => {
      camada.defCinco = { tipo: "jenks", quebras, compartilhada: camada.escala === "principais", fino };
      camada.coresCinco = cores;
    });
  });
}

function prepararCamadas(features) {
  prepararEscalas(features, (camada) => camada.campo, { def: "def", cores: "cores" });
  prepararEscalas(features, (camada) => camada.campoAbsoluto, { def: "defAbsoluto", cores: "coresAbsoluto" });
  prepararCinco(features);
  CAMADAS.filter((camada) => camada.tipo === "reais").forEach((camada) => {
    const valores = valoresDaCamada(features, camada.campo, camada.campo);
    const quebras = quebrasNaturais(valores, CLASSES_NATURAIS);
    camada.def = { tipo: "reais", quebras, compartilhada: false };
    camada.cores = coresSequenciais(quebras.length - 1);
  });
  prepararComparacoes(features);
}

function limiteSimetrico(valores) {
  const absolutos = valores.map((valor) => Math.abs(valor)).sort((a, b) => a - b);
  if (!absolutos.length) return 1;
  const posicao = Math.min(absolutos.length - 1, Math.floor(0.9 * (absolutos.length - 1)));
  const referencia = Math.max(1, absolutos[posicao]);
  const magnitude = 10 ** Math.floor(Math.log10(referencia));
  return Math.ceil(referencia / magnitude) * magnitude;
}

function prepararComparacoes(features) {
  CAMADAS.filter((camada) => camada.tipo === "div").forEach((camada) => {
    camada.def = { tipo: "div", min: -0.1, max: 0.1, compartilhada: true };
    camada.cores = ESPECTRAL.slice();
  });
  const grupos = new Map();
  CAMADAS.filter((camada) => camada.tipo === "div" && camada.campoAbsoluto).forEach((camada) => {
    const lista = grupos.get(camada.escalaDif) || [];
    lista.push(...valoresDaCamada(features, camada.campoAbsoluto, camada.campo));
    grupos.set(camada.escalaDif, lista);
  });
  grupos.forEach((valores, nome) => {
    const limite = limiteSimetrico(valores);
    CAMADAS.filter((camada) => camada.escalaDif === nome).forEach((camada) => {
      camada.defAbsoluto = { tipo: "div", min: -limite, max: limite, compartilhada: true };
      camada.coresAbsoluto = ESPECTRAL.slice();
    });
  });
}

function indice(valor, atual) {
  if (!numeroValido(valor)) return null;
  const numero = Number(valor);
  if (atual.def.tipo === "jenks" || atual.def.tipo === "reais") {
    const quebras = atual.def.quebras;
    const ultima = quebras.length - 2;
    for (let i = 0; i < ultima; i += 1) {
      if (numero <= quebras[i + 1]) return i;
    }
    return ultima;
  }
  const escala = atual.def;
  if (!escala.passo) return null;
  const limitado = Math.min(escala.max - escala.passo / 2, Math.max(escala.min, numero));
  const posicao = Math.floor((limitado - escala.min) / escala.passo);
  return Math.max(0, Math.min(atual.cores.length - 1, posicao));
}

function formatarPercentual(valor) {
  if (!numeroValido(valor)) return "sem dado";
  return `${(Number(valor) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatarVotos(valor) {
  if (!numeroValido(valor)) return "sem dado";
  return Math.round(Number(valor)).toLocaleString("pt-BR");
}

function formatarRenda(valor) {
  if (!numeroValido(valor)) return "sem dado";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const mapa = L.map("mapa", { zoomControl: false });
L.control.zoom({ position: "topright" }).addTo(mapa);
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri",
  maxZoom: 16,
}).addTo(mapa);

let camadaAtiva = CAMADAS[0];
let grade;
let modoAbsoluto = false;

function vista(camada) {
  if (modoAbsoluto && camada.campoAbsoluto && camada.defAbsoluto) {
    return {
      def: camada.defAbsoluto,
      cores: camada.coresAbsoluto,
      campo: camada.campoAbsoluto,
      absoluto: true,
    };
  }
  return { def: camada.def, cores: camada.cores, campo: camada.campo, absoluto: false };
}

function rotuloIpvs(valor) {
  const estrato = ESTRATOS_IPVS.find((item) => item.valor === Number(valor));
  return estrato ? estrato.rotulo : "sem dado";
}

function valorVisivel(propriedades, camada) {
  const atual = vista(camada);
  if (atual.absoluto && !numeroValido(propriedades[camada.campo])) return null;
  const valor = propriedades[atual.campo];
  return numeroValido(valor) ? Number(valor) : null;
}

function estilo(feature, destaque = false) {
  let fillColor = "#d9d9d9";
  let temDado = false;
  if (camadaAtiva.tipo === "disputa") {
    const parte = feature.properties[camadaAtiva.campo];
    if (numeroValido(parte)) {
      fillColor = corDaFaixa(Number(parte), FAIXAS_DISPUTA);
      temDado = true;
    }
  } else if (camadaAtiva.tipo === "div") {
    const atual = vista(camadaAtiva);
    const valor = feature.properties[atual.campo];
    if (numeroValido(valor) && atual.def) {
      fillColor = corEspectral(Number(valor), atual.def.min, atual.def.max);
      temDado = true;
    }
  } else if (camadaAtiva.tipo === "estrato") {
    const estrato = ESTRATOS_IPVS.find((item) => item.valor === Number(feature.properties[camadaAtiva.campo]));
    if (estrato) {
      fillColor = estrato.cor;
      temDado = true;
    }
  } else if (camadaAtiva.tipo === "jenks" || camadaAtiva.tipo === "reais") {
    const atual = vista(camadaAtiva);
    const cinco = camadaAtiva.tipo === "jenks" && !atual.absoluto && camadaAtiva.defCinco;
    const definicao = cinco
      ? { def: camadaAtiva.defCinco, cores: camadaAtiva.coresCinco }
      : atual;
    if (definicao.def && definicao.cores) {
      const i = indice(valorVisivel(feature.properties, camadaAtiva), definicao);
      if (i !== null) {
        fillColor = definicao.cores[i];
        temDado = true;
      }
    }
  }
  return {
    fillColor,
    color: "#1c1917",
    weight: destaque ? 2 : 0,
    opacity: destaque ? 1 : 0,
    stroke: destaque,
    fillOpacity: temDado ? OPACIDADE : 0,
    fill: temDado,
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
  if (camada.tipo === "div") {
    const atual = vista(camada);
    const texto = atual.absoluto ? formatarVotos(propriedades[atual.campo]) : formatarPercentual(propriedades[atual.campo]);
    return `${camada.rotulo}: ${texto}`;
  }
  if (camada.tipo === "estrato") return `${camada.rotulo}: ${rotuloIpvs(propriedades[camada.campo])}`;
  if (camada.tipo === "reais") return `${camada.rotulo}: ${formatarRenda(propriedades[camada.campo])}`;
  const valor = valorVisivel(propriedades, camada);
  const texto = vista(camada).absoluto ? formatarVotos(valor) : formatarPercentual(valor);
  return `${camada.rotulo}: ${texto}`;
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
  const extras = [];
  if (camadaAtiva.tipo !== "reais") extras.push(`Renda mediana: ${formatarRenda(p.renda_mediana)}`);
  if (camadaAtiva.id !== "ipvs") extras.push(`IPVS: ${rotuloIpvs(p.ipvs)}`);
  return `<strong>${camadaAtiva.grupo}</strong><br>${linhas}<br>${p.nm_mun || "sem município"}<br>${extras.join("<br>")}`;
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
  if (camadaAtiva.tipo === "estrato") {
    faixa.classList.add("lista");
    ESTRATOS_IPVS.forEach((estrato) => {
      const item = document.createElement("div");
      item.className = "classe";
      item.innerHTML = `<i style="background:${estrato.cor}"></i><span>${estrato.rotulo}</span>`;
      faixa.appendChild(item);
    });
    nota.textContent = "Classe mais frequente dos setores cujo centroide cai na célula. Verde é a menor vulnerabilidade e vermelho é a maior. Setores não classificados ficam de fora.";
    return;
  }
  if (!camadaAtiva.cores) {
    nota.textContent = "";
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
    etiquetas.forEach((texto, indiceEtiqueta) => {
      const marca = document.createElement("span");
      marca.textContent = texto;
      marca.title = rotuloDisputa(FAIXAS_DISPUTA[indiceEtiqueta], adversario);
      marcas.appendChild(marca);
    });
    nota.textContent = `Escala de 5 em 5 pontos até 75% da soma. À esquerda, Lula; à direita, ${adversario}. As cores se encontram no meio.`;
    return;
  }
  if (camadaAtiva.tipo === "jenks" && !vista(camadaAtiva).absoluto && camadaAtiva.defCinco) {
    const quebras = camadaAtiva.defCinco.quebras;
    camadaAtiva.coresCinco.forEach((cor, i) => {
      const parte = document.createElement("span");
      parte.style.background = cor;
      parte.title = `${formatarPercentual(quebras[i])} a ${formatarPercentual(quebras[i + 1])}`;
      faixa.appendChild(parte);
    });
    marcas.className = "marcas passos";
    camadaAtiva.coresCinco.forEach((_, i) => {
      const marca = document.createElement("span");
      const pontos = Math.round(quebras[i] * 1000) / 10;
      marca.textContent = `${pontos.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
      marcas.appendChild(marca);
    });
    const notaEscala = camadaAtiva.defCinco.fino
      ? "Escala de 1,5 em 1,5 pontos percentuais, entre o menor e o maior valor deste candidato. A cor mais escura é o topo dele."
      : `Escala de 5 em 5 pontos percentuais.${camadaAtiva.escala === "principais" ? " Mesma escala de Lula e Bolsonaro, nos dois anos." : ""}`;
    nota.textContent = notaEscala;
    return;
  }
  if ((camadaAtiva.escala === "demais" || camadaAtiva.escala === "invalidos" || camadaAtiva.escala === "comparecimento") && vista(camadaAtiva).def) {
    const atual = vista(camadaAtiva);
    const formatar = atual.absoluto ? formatarVotos : formatarPercentual;
    const quebras = atual.def.quebras;
    atual.cores.forEach((cor, i) => {
      const parte = document.createElement("span");
      parte.style.background = cor;
      parte.title = `${formatar(quebras[i])} a ${formatar(quebras[i + 1])}`;
      faixa.appendChild(parte);
    });
    marcas.className = "marcas passos";
    atual.cores.forEach((_, i) => {
      const marca = document.createElement("span");
      marca.textContent = formatar(quebras[i]);
      marcas.appendChild(marca);
    });
    const unidade = atual.absoluto ? " A escala está em votos." : "";
    const notaEscala = camadaAtiva.escala === "demais"
      ? "Dez classes por quebras naturais, entre o menor e o maior valor deste candidato. A cor mais escura é o topo dele."
      : "Dez classes por quebras naturais, calculadas com 2022 e 2026 juntos. A mesma escala vale nos dois anos.";
    nota.textContent = `${notaEscala}${unidade}`;
    return;
  }
  if (camadaAtiva.def && (camadaAtiva.def.tipo === "jenks" || camadaAtiva.def.tipo === "reais")) {
    const atual = vista(camadaAtiva);
    const formatar = camadaAtiva.def.tipo === "reais"
      ? formatarRenda
      : (atual.absoluto ? formatarVotos : formatarPercentual);
    faixa.classList.add("lista");
    const quebras = atual.def.quebras;
    atual.cores.forEach((cor, i) => {
      const item = document.createElement("div");
      item.className = "classe";
      item.innerHTML = `<i style="background:${cor}"></i><span>${formatar(quebras[i])} a ${formatar(quebras[i + 1])}</span>`;
      faixa.appendChild(item);
    });
    if (camadaAtiva.def.tipo === "reais") {
      nota.textContent = "Mediana, em cada célula, do rendimento nominal mediano mensal da pessoa responsável nos setores cujo centroide cai na célula.";
      return;
    }
    const unidade = atual.absoluto ? " A escala está em votos." : "";
    nota.textContent = `${notaDaEscala(camadaAtiva)}.${unidade}`;
    return;
  }
  if (camadaAtiva.def.tipo === "div") {
    const atual = vista(camadaAtiva);
    const escala = atual.def;
    const formatar = atual.absoluto ? formatarVotos : formatarPercentual;
    ESPECTRAL.forEach((cor) => {
      const parte = document.createElement("span");
      parte.style.background = cor;
      faixa.appendChild(parte);
    });
    const zero = ((0 - escala.min) / (escala.max - escala.min)) * 100;
    const marcaZero = atual.absoluto ? "0" : "0%";
    marcas.innerHTML = `<span>${formatar(escala.min)}</span><span class="zero" style="left:${zero}%">${marcaZero}</span><span>${formatar(escala.max)}</span>`;
    const mesma = camadaAtiva.escalaDif === "difPrincipais" ? " Mesma escala de Lula e de Bolsonaro/Flávio." : "";
    nota.textContent = atual.absoluto
      ? `Diferença de votos, 2026 menos 2022.${mesma} A cor mais forte vale a partir desse limite. Azul é redução e vermelho é crescimento.`
      : "Diferença dos percentuais, 2026 menos 2022. Escala contínua de −10% a +10%. A cor mais forte vale a partir desse limite. Azul é redução e vermelho é crescimento.";
  }
}

function notaDaEscala(camada) {
  if (camada.escala === "principais" || camada.escalaDif === "difPrincipais") {
    return "Mesma escala de Lula e Bolsonaro, nos dois anos";
  }
  if (camada.escala === "invalidos" || camada.escalaDif === "difInvalidos") {
    return "Mesma escala de inválidos em 2022 e em 2026";
  }
  if (camada.escala === "comparecimento" || camada.escalaDif === "difComparecimento") {
    return "Mesma escala de não comparecimento em 2022 e em 2026";
  }
  return "Quebras naturais desta camada";
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

function camadasDoGrupo(nome) {
  return CAMADAS.filter((item) => item.grupo === nome);
}

function preencherCamadas(grupo, rotuloPreferido) {
  const select = document.getElementById("camada");
  const lista = camadasDoGrupo(grupo);
  select.replaceChildren();
  lista.forEach((item) => {
    const opcao = document.createElement("option");
    opcao.value = item.id;
    opcao.textContent = item.rotulo;
    select.appendChild(opcao);
  });
  const igual = lista.find((item) => item.rotulo === rotuloPreferido);
  select.value = (igual || lista[0]).id;
  aplicarCamada(select.value);
}

function montarPainel() {
  const grupo = document.getElementById("grupo");
  const camada = document.getElementById("camada");
  [...new Set(CAMADAS.map((item) => item.grupo))].forEach((nome) => {
    const opcao = document.createElement("option");
    opcao.value = nome;
    opcao.textContent = nome;
    grupo.appendChild(opcao);
  });
  grupo.addEventListener("change", () => {
    const atual = CAMADAS.find((item) => item.id === camada.value);
    preencherCamadas(grupo.value, atual ? atual.rotulo : "");
  });
  camada.addEventListener("change", () => aplicarCamada(camada.value));
  preencherCamadas(grupo.value, "");
}

function montarInterruptor() {
  const controle = document.getElementById("modo-valor");
  controle.addEventListener("change", () => {
    modoAbsoluto = controle.checked;
    aplicarCamada(camadaAtiva.id);
  });
}

montarPainel();
montarInterruptor();

fetch("dados/grade.geojson?v=21")
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
    mapa.fitBounds([[-24.02, -46.46], [-23.94, -46.34]]);
    desenharLegenda();
  });
