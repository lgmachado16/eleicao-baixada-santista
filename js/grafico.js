const FAIXAS = [
  { rotulo: "até 1.000", minimo: 0, maximo: 1000 },
  { rotulo: "1.000 a 1.500", minimo: 1000, maximo: 1500 },
  { rotulo: "1.500 a 2.000", minimo: 1500, maximo: 2000 },
  { rotulo: "2.000 a 3.000", minimo: 2000, maximo: 3000 },
  { rotulo: "3.000 a 5.000", minimo: 3000, maximo: 5000 },
  { rotulo: "acima de 5.000", minimo: 5000, maximo: Infinity },
];

const COR_PERDA = "#5e4fa2";
const COR_GANHO = "#9e0142";

function indiceFaixa(renda) {
  const indice = FAIXAS.findIndex((faixa) => renda <= faixa.maximo);
  return indice === -1 ? FAIXAS.length - 1 : indice;
}

function contar(features, campo) {
  const perdeu = FAIXAS.map(() => 0);
  const ganhou = FAIXAS.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    const renda = p.renda_mediana;
    const variacao = p[campo];
    if (renda === null || renda === undefined || variacao === null || variacao === undefined) return;
    const indice = indiceFaixa(Number(renda));
    if (indice < 0) return;
    const valor = Number(variacao);
    if (valor < 0) perdeu[indice] += 1;
    else if (valor > 0) ganhou[indice] += 1;
  });
  return { perdeu, ganhou };
}

function desenhar(canvas, contagem, maximo) {
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: FAIXAS.map((faixa) => faixa.rotulo),
      datasets: [
        { label: "Perdeu", data: contagem.perdeu, backgroundColor: COR_PERDA },
        { label: "Ganhou", data: contagem.ganhou, backgroundColor: COR_GANHO },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      plugins: {
        tooltip: {
          callbacks: {
            label(contexto) {
              return `${contexto.dataset.label}: ${contexto.raw} células`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Renda mediana do responsável (R$)" } },
        y: {
          beginAtZero: true,
          max: maximo,
          title: { display: true, text: "Quantidade de células" },
          ticks: { precision: 0 },
        },
      },
    },
  });
}

fetch("dados/grade.geojson?v=10")
  .then((resposta) => resposta.json())
  .then((dados) => {
    const lula = contar(dados.features, "dif_pct_lula");
    const bolsonaro = contar(dados.features, "dif_pct_bolsonaro");
    const maximo = Math.max(...lula.perdeu, ...lula.ganhou, ...bolsonaro.perdeu, ...bolsonaro.ganhou);
    desenhar(document.getElementById("grafico-lula"), lula, maximo);
    desenhar(document.getElementById("grafico-bolsonaro"), bolsonaro, maximo);
  });
