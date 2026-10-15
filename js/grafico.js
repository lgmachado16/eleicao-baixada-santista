const FAIXAS = [
  { rotulo: "até 1.000", minimo: 0, maximo: 1000 },
  { rotulo: "1.000 a 1.500", minimo: 1000, maximo: 1500 },
  { rotulo: "1.500 a 2.000", minimo: 1500, maximo: 2000 },
  { rotulo: "2.000 a 3.000", minimo: 2000, maximo: 3000 },
  { rotulo: "3.000 a 5.000", minimo: 3000, maximo: 5000 },
  { rotulo: "acima de 5.000", minimo: 5000, maximo: Infinity },
];

const COR_PERDA = "#cc2812";
const COR_GANHO = "#1a9850";
const COR_2022 = "#3288bd";
const COR_2026 = "#9a3412";

function indiceFaixa(renda) {
  const indice = FAIXAS.findIndex((faixa) => renda <= faixa.maximo);
  return indice === -1 ? FAIXAS.length - 1 : indice;
}

function numeroValido(valor) {
  return valor !== null && valor !== undefined && Number.isFinite(Number(valor));
}

function contar(features, campo) {
  const perdeu = FAIXAS.map(() => 0);
  const ganhou = FAIXAS.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    if (!numeroValido(p.renda_mediana) || !numeroValido(p[campo])) return;
    const indice = indiceFaixa(Number(p.renda_mediana));
    const valor = Number(p[campo]);
    if (valor < 0) perdeu[indice] += 1;
    else if (valor > 0) ganhou[indice] += 1;
  });
  return { perdeu, ganhou };
}

function somarDiferenca(features, campo) {
  const perdeu = FAIXAS.map(() => 0);
  const ganhou = FAIXAS.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    if (!numeroValido(p.renda_mediana) || !numeroValido(p[campo])) return;
    const indice = indiceFaixa(Number(p.renda_mediana));
    const valor = Number(p[campo]);
    if (valor < 0) perdeu[indice] += -valor;
    else if (valor > 0) ganhou[indice] += valor;
  });
  return {
    perdeu: perdeu.map((valor) => Math.round(valor)),
    ganhou: ganhou.map((valor) => Math.round(valor)),
  };
}

function somarVotos(features, campo, campoBase) {
  const votos = FAIXAS.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    if (!numeroValido(p.renda_mediana) || !numeroValido(p[campoBase]) || !numeroValido(p[campo])) return;
    votos[indiceFaixa(Number(p.renda_mediana))] += Number(p[campo]);
  });
  return votos.map((valor) => Math.round(valor));
}

function maximoDe(series) {
  return Math.max(...series.flat());
}

function desenhar(canvas, series, maximo, tituloY, unidade) {
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: FAIXAS.map((faixa) => faixa.rotulo),
      datasets: series.map((serie) => ({
        label: serie.rotulo,
        data: serie.dados,
        backgroundColor: serie.cor,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      plugins: {
        tooltip: {
          callbacks: {
            label(contexto) {
              const quantidade = Number(contexto.raw).toLocaleString("pt-BR");
              return `${contexto.dataset.label}: ${quantidade} ${unidade}`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Renda mediana do responsável (R$)" } },
        y: {
          beginAtZero: true,
          max: maximo,
          title: { display: true, text: tituloY },
          ticks: {
            precision: 0,
            callback(valor) {
              return Number(valor).toLocaleString("pt-BR");
            },
          },
        },
      },
    },
  });
}

const COR_TOTAL = "#1c1917";
const COR_LULA = "#cc2812";
const COR_ADVERSARIO = "#967311";
const COR_INVALIDOS = "#6a51a3";
const COR_NC = "#3288bd";

function seriesVariacao(contagem) {
  return [
    { rotulo: "Perdeu", dados: contagem.perdeu, cor: COR_PERDA },
    { rotulo: "Ganhou", dados: contagem.ganhou, cor: COR_GANHO },
  ];
}

function parcela(votos) {
  const soma = votos.reduce((acumulado, valor) => acumulado + valor, 0);
  if (soma <= 0) return votos.map(() => 0);
  return votos.map((valor) => Math.round((valor / soma) * 1000) / 10);
}

function desenharLinha(canvas, series, maximo) {
  new Chart(canvas, {
    type: "line",
    data: {
      labels: FAIXAS.map((faixa) => faixa.rotulo),
      datasets: series.map((serie) => ({
        label: serie.rotulo,
        data: serie.dados,
        borderColor: serie.cor,
        backgroundColor: serie.cor,
        borderWidth: serie.referencia ? 3 : 2,
        pointRadius: 3,
        tension: 0,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      plugins: {
        tooltip: {
          callbacks: {
            label(contexto) {
              const quantidade = Number(contexto.raw).toLocaleString("pt-BR");
              return `${contexto.dataset.label}: ${quantidade}%`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Renda mediana do responsável (R$)" } },
        y: {
          beginAtZero: true,
          max: maximo,
          title: { display: true, text: "Parcela do próprio grupo (%)" },
          ticks: {
            callback(valor) {
              return `${Number(valor).toLocaleString("pt-BR")}%`;
            },
          },
        },
      },
    },
  });
}

fetch("dados/grade.geojson?v=13")
  .then((resposta) => resposta.json())
  .then((dados) => {
    const features = dados.features;
    const lula = contar(features, "dif_pct_lula");
    const bolsonaro = contar(features, "dif_pct_bolsonaro");
    const invalidos = contar(features, "dif_pct_invalidos");
    const nc = contar(features, "dif_pct_nc");
    const maximoCelulas = maximoDe([
      lula.perdeu, lula.ganhou, bolsonaro.perdeu, bolsonaro.ganhou,
      invalidos.perdeu, invalidos.ganhou, nc.perdeu, nc.ganhou,
    ]);
    desenhar(document.getElementById("grafico-lula"), seriesVariacao(lula), maximoCelulas, "Quantidade de células", "células");
    desenhar(document.getElementById("grafico-bolsonaro"), seriesVariacao(bolsonaro), maximoCelulas, "Quantidade de células", "células");
    desenhar(document.getElementById("grafico-invalidos"), seriesVariacao(invalidos), maximoCelulas, "Quantidade de células", "células");
    desenhar(document.getElementById("grafico-nc"), seriesVariacao(nc), maximoCelulas, "Quantidade de células", "células");

    const lulaVotos = somarDiferenca(features, "dif_lula");
    const bolsonaroVotos = somarDiferenca(features, "dif_bolsonaro");
    const invalidosVotos = somarDiferenca(features, "dif_invalidos");
    const ncVotos = somarDiferenca(features, "dif_nc");
    const maximoDiferenca = maximoDe([
      lulaVotos.perdeu, lulaVotos.ganhou,
      bolsonaroVotos.perdeu, bolsonaroVotos.ganhou,
      invalidosVotos.perdeu, invalidosVotos.ganhou,
      ncVotos.perdeu, ncVotos.ganhou,
    ]);
    desenhar(document.getElementById("grafico-lula-votos"), seriesVariacao(lulaVotos), maximoDiferenca, "Votos", "votos");
    desenhar(document.getElementById("grafico-bolsonaro-votos"), seriesVariacao(bolsonaroVotos), maximoDiferenca, "Votos", "votos");
    desenhar(document.getElementById("grafico-invalidos-votos"), seriesVariacao(invalidosVotos), maximoDiferenca, "Votos", "votos");
    desenhar(document.getElementById("grafico-nc-votos"), seriesVariacao(ncVotos), maximoDiferenca, "Votos", "votos");

    const totais = [
      somarVotos(features, "votos_lula_2022", "pct_lula_2022"),
      somarVotos(features, "votos_lula_2026", "pct_lula_2026"),
      somarVotos(features, "votos_bolsonaro_2022", "pct_bolsonaro_2022"),
      somarVotos(features, "votos_flavio_2026", "pct_flavio_2026"),
      somarVotos(features, "votos_invalidos_2022", "pct_invalidos_2022"),
      somarVotos(features, "votos_invalidos_2026", "pct_invalidos_2026"),
      somarVotos(features, "votos_nc_2022", "pct_nc_2022"),
      somarVotos(features, "votos_nc_2026", "pct_nc_2026"),
    ];
    const maximoTotal = maximoDe(totais);
    const serieAno = (rotulo, dados, cor) => ({ rotulo, dados, cor });
    desenhar(document.getElementById("grafico-lula-total"), [
      serieAno("2022", totais[0], COR_2022),
      serieAno("2026", totais[1], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(document.getElementById("grafico-bolsonaro-total"), [
      serieAno("2022", totais[2], COR_2022),
      serieAno("2026", totais[3], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(document.getElementById("grafico-invalidos-total"), [
      serieAno("2022", totais[4], COR_2022),
      serieAno("2026", totais[5], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(document.getElementById("grafico-nc-total"), [
      serieAno("2022", totais[6], COR_2022),
      serieAno("2026", totais[7], COR_2026),
    ], maximoTotal, "Votos", "votos");

    const forma = (rotulo, votos, cor, referencia = false) => ({
      rotulo,
      dados: parcela(votos),
      cor,
      referencia,
    });
    const forma2026 = [
      forma("Total de votos", somarVotos(features, "votos_totais_2026", "votos_totais_2026"), COR_TOTAL, true),
      forma("Lula", totais[1], COR_LULA),
      forma("Flávio", totais[3], COR_ADVERSARIO),
      forma("Inválidos", totais[5], COR_INVALIDOS),
      forma("Não comparecimento", totais[7], COR_NC),
    ];
    const forma2022 = [
      forma("Total de votos", somarVotos(features, "votos_totais_2022", "votos_totais_2022"), COR_TOTAL, true),
      forma("Lula", totais[0], COR_LULA),
      forma("Bolsonaro", totais[2], COR_ADVERSARIO),
      forma("Inválidos", totais[4], COR_INVALIDOS),
      forma("Não comparecimento", totais[6], COR_NC),
    ];
    const maximoForma = maximoDe([...forma2026, ...forma2022].map((serie) => serie.dados));
    desenharLinha(document.getElementById("grafico-forma-2026"), forma2026, maximoForma);
    desenharLinha(document.getElementById("grafico-forma-2022"), forma2022, maximoForma);
  });
