const CLASSES = ["Baixíssima", "Muito baixa", "Baixa", "Média", "Alta", "Muito alta"];
const COMPARACOES = [
  { id: "turno-2026", rotulo: "2026, 2º − 1º", cor: "#d73027", corQueda: "#f4a6a0", inicial: true },
  { id: "turno-2022", rotulo: "2022, 2º − 1º", cor: "#4575b4", corQueda: "#a6cee3", inicial: true },
  { id: "ano-1", rotulo: "1º turno, 2026 − 2022", cor: "#b8860b", corQueda: "#f3e0a4", inicial: false },
  { id: "ano-2", rotulo: "2º turno, 2026 − 2022", cor: "#762a83", corQueda: "#d7b3dc", inicial: false },
];
const ANOS = [
  { id: "2026", rotulo: "2026, 2º − 1º", indice: 0, forma: "circle" },
  { id: "2022", rotulo: "2022, 2º − 1º", indice: 1, forma: "triangle" },
];

const SEGMENTOS = [
  {
    id: "lula",
    rotulo: "Lula",
    cor: "#b2182b",
    pares: [
      ["dif_lula_turno_2026", "votos_lula_2026"],
      ["dif_lula_turno_2022", "votos_lula_2022"],
      ["dif_lula", "votos_lula_2022"],
      ["dif_lula_anos_2t", "votos_lula_2022_2t"],
    ],
  },
  {
    id: "adversario",
    rotulo: "Flávio/Bolsonaro",
    cor: "#b8860b",
    pares: [
      ["dif_flavio_turno_2026", "votos_flavio_2026"],
      ["dif_bolsonaro_turno_2022", "votos_bolsonaro_2022"],
      ["dif_bolsonaro", "votos_bolsonaro_2022"],
      ["dif_bolsonaro_anos_2t", "votos_bolsonaro_2022_2t"],
    ],
  },
  {
    id: "invalidos",
    rotulo: "Inválidos",
    cor: "#525252",
    pares: [
      ["dif_invalidos_turno_2026", "votos_invalidos_2026"],
      ["dif_invalidos_turno_2022", "votos_invalidos_2022"],
      ["dif_invalidos", "votos_invalidos_2022"],
      ["dif_invalidos_anos_2t", "votos_invalidos_2022_2t"],
    ],
  },
  {
    id: "nc",
    rotulo: "Não comparecimento",
    cor: "#1b7837",
    pares: [
      ["dif_nc_turno_2026", "votos_nc_2026"],
      ["dif_nc_turno_2022", "votos_nc_2022"],
      ["dif_nc", "votos_nc_2022"],
      ["dif_nc_anos_2t", "votos_nc_2022_2t"],
    ],
  },
];

let agregados = [];
let celulas = [];

function numeroValido(valor) {
  return valor !== null && valor !== undefined && Number.isFinite(Number(valor));
}

function classeDe(propriedades) {
  const valor = Number(propriedades.ipvs);
  if (valor >= 1 && valor <= 6) return valor - 1;
  return null;
}

function marcado(id) {
  const campo = document.getElementById(id);
  return Boolean(campo && campo.checked);
}

function agregar(features, campoDif, campoBase) {
  const absoluto = Array(CLASSES.length).fill(0);
  const diferencaTaxa = Array(CLASSES.length).fill(0);
  const baseTaxa = Array(CLASSES.length).fill(0);
  features.forEach((feature) => {
    const propriedades = feature.properties;
    const indice = classeDe(propriedades);
    if (indice === null || !numeroValido(propriedades[campoDif])) return;
    const diferenca = Number(propriedades[campoDif]);
    absoluto[indice] += diferenca;
    if (numeroValido(propriedades[campoBase]) && Number(propriedades[campoBase]) > 0) {
      diferencaTaxa[indice] += diferenca;
      baseTaxa[indice] += Number(propriedades[campoBase]);
    }
  });
  return {
    absoluto: absoluto.map((valor) => Math.round(valor)),
    taxa: diferencaTaxa.map((valor, indice) => (baseTaxa[indice] > 0 ? valor / baseTaxa[indice] : null)),
  };
}

function limiteDe(listas) {
  const valores = listas.flat(Infinity).filter(numeroValido).map((valor) => Math.abs(Number(valor)));
  return valores.length ? Math.max(...valores) * 1.05 : 1;
}

function formatarVotos(valor) {
  return Number(valor).toLocaleString("pt-BR");
}

function formatarTaxa(valor) {
  return `${(Number(valor) * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatarReais(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function comAlfa(hex, alfa) {
  const numero = parseInt(hex.slice(1), 16);
  const canal = (deslocamento) => (numero >> deslocamento) & 255;
  return `rgba(${canal(16)}, ${canal(8)}, ${canal(0)}, ${alfa})`;
}

function corDaBarra(valor, comparacao) {
  if (!numeroValido(valor) || Number(valor) === 0) return "#d4d4d8";
  return Number(valor) < 0 ? comparacao.corQueda : comparacao.cor;
}

function comparacoesMarcadas() {
  return COMPARACOES.filter((item) => marcado(`comparacao-${item.id}`));
}

function opcao(id, rotulo, cor, ligado) {
  const rotuloCampo = document.createElement("label");
  const campo = document.createElement("input");
  campo.type = "checkbox";
  campo.id = id;
  campo.checked = ligado;
  const amostra = document.createElement("i");
  amostra.className = "amostra";
  amostra.style.background = cor;
  rotuloCampo.append(campo, amostra, document.createTextNode(rotulo));
  return rotuloCampo;
}

function opcaoForma(id, rotulo, forma, ligado) {
  const rotuloCampo = document.createElement("label");
  const campo = document.createElement("input");
  campo.type = "checkbox";
  campo.id = id;
  campo.checked = ligado;
  const marca = document.createElement("i");
  marca.className = forma === "triangle" ? "marca marca-triangulo" : "marca marca-circulo";
  rotuloCampo.append(campo, marca, document.createTextNode(rotulo));
  return rotuloCampo;
}

function montarSeletores() {
  const comparacoes = document.getElementById("seletor-comparacoes");
  COMPARACOES.forEach((item) => {
    comparacoes.appendChild(opcao(`comparacao-${item.id}`, item.rotulo, item.cor, item.inicial));
  });
  const segmentos = document.getElementById("seletor-segmentos");
  SEGMENTOS.forEach((item) => {
    segmentos.appendChild(opcao(`segmento-${item.id}`, item.rotulo, item.cor, item.id === "lula"));
  });
  const anos = document.getElementById("seletor-anos");
  ANOS.forEach((item) => {
    anos.appendChild(opcaoForma(`ano-${item.id}`, item.rotulo, item.forma, true));
  });
  document.querySelectorAll(".seletor input").forEach((campo) => {
    campo.addEventListener("change", atualizar);
  });
}

function desenharBarras(canvas, series, limite, taxa) {
  const existente = Chart.getChart(canvas);
  if (existente) existente.destroy();
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: CLASSES,
      datasets: series.map((serie) => ({
        label: serie.comparacao.rotulo,
        data: serie.dados,
        cor: serie.comparacao.cor,
        backgroundColor: serie.dados.map((valor) => corDaBarra(valor, serie.comparacao)),
        borderWidth: 0,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      plugins: {
        legend: {
          position: "bottom",
          onClick() {},
          labels: {
            boxWidth: 12,
            generateLabels(grafico) {
              return grafico.data.datasets.map((dataset, indice) => ({
                text: dataset.label,
                fillStyle: dataset.cor,
                strokeStyle: dataset.cor,
                lineWidth: 0,
                datasetIndex: indice,
                hidden: !grafico.isDatasetVisible(indice),
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label(contexto) {
              const valor = contexto.parsed.y;
              const texto = taxa ? formatarTaxa(valor) : formatarVotos(valor);
              return `${contexto.dataset.label}: ${texto}`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Classe de vulnerabilidade (IPVS)" } },
        y: {
          min: -limite,
          max: limite,
          title: { display: true, text: taxa ? "Taxa sobre os votos de partida" : "Diferença de votos" },
          ticks: {
            callback(valor) {
              return taxa ? formatarTaxa(valor) : formatarVotos(valor);
            },
          },
        },
      },
    },
  });
}

function pontosDoTurno(segmento, indiceAno) {
  const [campoDif, campoBase] = segmento.pares[indiceAno];
  const pontos = [];
  celulas.forEach((feature) => {
    const propriedades = feature.properties;
    const renda = propriedades.renda_media_das_medias;
    const base = propriedades[campoBase];
    const diferenca = propriedades[campoDif];
    if (!numeroValido(renda) || !numeroValido(diferenca) || !numeroValido(base) || Number(base) <= 0) return;
    const mediana = propriedades.renda_mediana_das_medias;
    pontos.push({
      x: Number(renda),
      y: Number(diferenca) / Number(base),
      mediana: numeroValido(mediana) ? Number(mediana) : null,
    });
  });
  return pontos;
}

function reta(pontos) {
  if (pontos.length < 2) return null;
  let somaX = 0;
  let somaY = 0;
  let somaXX = 0;
  let somaXY = 0;
  pontos.forEach((ponto) => {
    somaX += ponto.x;
    somaY += ponto.y;
    somaXX += ponto.x * ponto.x;
    somaXY += ponto.x * ponto.y;
  });
  const denominador = pontos.length * somaXX - somaX * somaX;
  if (denominador === 0) return null;
  const inclinacao = (pontos.length * somaXY - somaX * somaY) / denominador;
  const intercepto = (somaY - inclinacao * somaX) / pontos.length;
  const ordenados = pontos.map((ponto) => ponto.x).sort((a, b) => a - b);
  const inicio = ordenados[0];
  const fim = ordenados[ordenados.length - 1];
  return [
    { x: inicio, y: inclinacao * inicio + intercepto },
    { x: fim, y: inclinacao * fim + intercepto },
  ];
}

function desenharDispersao() {
  const canvas = document.getElementById("correlacao");
  const existente = Chart.getChart(canvas);
  if (existente) existente.destroy();
  const series = [];
  const linhas = [];
  SEGMENTOS.forEach((segmento) => {
    if (!marcado(`segmento-${segmento.id}`)) return;
    ANOS.forEach((ano) => {
      if (!marcado(`ano-${ano.id}`)) return;
      const pontos = pontosDoTurno(segmento, ano.indice);
      series.push({
        label: `${segmento.rotulo}, ${ano.rotulo}`,
        data: pontos,
        backgroundColor: comAlfa(segmento.cor, 0.45),
        borderColor: segmento.cor,
        borderWidth: 1.5,
        hoverBorderWidth: 1.5,
        pointStyle: ano.forma,
        pointRadius: ano.forma === "circle" ? 3.6 : 5,
        pointHoverRadius: ano.forma === "circle" ? 5 : 7,
      });
      const linha = reta(pontos);
      if (linha) {
        linhas.push({
          pontos: linha,
          cor: segmento.cor,
          traco: ano.id === "2022" ? [6, 4] : [],
        });
      }
    });
  });
  new Chart(canvas, {
    type: "scatter",
    data: { datasets: series },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      plugins: {
        legend: {
          position: "bottom",
          onClick() {},
          labels: { usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          callbacks: {
            label(contexto) {
              const ponto = contexto.raw;
              const linhas = [
                `${contexto.dataset.label}: ${formatarTaxa(ponto.y)}`,
                `Média dos rendimentos médios: ${formatarReais(ponto.x)}`,
              ];
              if (numeroValido(ponto.mediana)) {
                linhas.push(`Mediana dos rendimentos médios: ${formatarReais(ponto.mediana)}`);
              }
              return linhas;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Média dos rendimentos médios (R$)" },
          ticks: {
            callback(valor) {
              return formatarReais(valor);
            },
          },
        },
        y: {
          title: { display: true, text: "Taxa, 2º turno menos 1º turno" },
          ticks: {
            callback(valor) {
              return formatarTaxa(valor);
            },
          },
        },
      },
    },
    plugins: [{
      id: "tendencias",
      afterDatasetsDraw(grafico) {
        const { ctx, chartArea, scales } = grafico;
        ctx.save();
        ctx.beginPath();
        ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        ctx.clip();
        linhas.forEach((linha) => {
          const [inicio, fim] = linha.pontos;
          ctx.beginPath();
          ctx.strokeStyle = linha.cor;
          ctx.lineWidth = 2;
          ctx.setLineDash(linha.traco);
          ctx.moveTo(scales.x.getPixelForValue(inicio.x), scales.y.getPixelForValue(inicio.y));
          ctx.lineTo(scales.x.getPixelForValue(fim.x), scales.y.getPixelForValue(fim.y));
          ctx.stroke();
        });
        ctx.restore();
      },
    }],
  });
}

function atualizar() {
  const ativas = comparacoesMarcadas();
  const indices = ativas.map((item) => COMPARACOES.indexOf(item));
  const votos = agregados.map((grupo) => indices.map((indice) => grupo[indice].absoluto));
  const taxas = agregados.map((grupo) => indices.map((indice) => grupo[indice].taxa));
  const limiteVotos = limiteDe(votos);
  const limiteTaxa = limiteDe(taxas);
  agregados.forEach((grupo, indiceSegmento) => {
    const segmento = SEGMENTOS[indiceSegmento];
    const series = ativas.map((comparacao) => {
      const posicao = COMPARACOES.indexOf(comparacao);
      return { comparacao, absoluto: grupo[posicao].absoluto, taxa: grupo[posicao].taxa };
    });
    desenharBarras(
      document.getElementById(`${segmento.id}-absoluto`),
      series.map((serie) => ({ comparacao: serie.comparacao, dados: serie.absoluto })),
      limiteVotos,
      false,
    );
    desenharBarras(
      document.getElementById(`${segmento.id}-taxa`),
      series.map((serie) => ({ comparacao: serie.comparacao, dados: serie.taxa })),
      limiteTaxa,
      true,
    );
  });
  desenharDispersao();
}

function preparar(features) {
  celulas = features;
  agregados = SEGMENTOS.map((segmento) => segmento.pares.map(([campoDif, campoBase]) => agregar(features, campoDif, campoBase)));
  atualizar();
}

montarSeletores();

fetch("dados/grade.geojson?v=24")
  .then((resposta) => resposta.json())
  .then((dados) => preparar(dados.features));
