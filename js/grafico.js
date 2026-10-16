let faixas = [];
let classificar = () => null;
let tituloEixo = "Renda mediana do responsável (R$)";

const COR_PERDA = "#cc2812";
const COR_GANHO = "#1a9850";
const COR_2022 = "#3288bd";
const COR_2026 = "#9a3412";

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

function formatarReais(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function montarFaixas(features) {
  const valores = features
    .map((feature) => feature.properties.renda_mediana)
    .filter(numeroValido)
    .map(Number);
  const quebras = quebrasNaturais(valores, 5);
  faixas = quebras.slice(0, -1).map((inicio, indice) => ({
    rotulo: `${formatarReais(inicio)} a ${formatarReais(quebras[indice + 1])}`,
    maximo: quebras[indice + 1],
  }));
}

function indiceFaixa(renda) {
  const indice = faixas.findIndex((faixa) => renda <= faixa.maximo);
  return indice === -1 ? faixas.length - 1 : indice;
}

function numeroValido(valor) {
  return valor !== null && valor !== undefined && Number.isFinite(Number(valor));
}

function contar(features, campo) {
  const perdeu = faixas.map(() => 0);
  const ganhou = faixas.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    const indice = classificar(p);
    if (indice === null || !numeroValido(p[campo])) return;
    const valor = Number(p[campo]);
    if (valor < 0) perdeu[indice] += 1;
    else if (valor > 0) ganhou[indice] += 1;
  });
  return { perdeu, ganhou };
}

function somarDiferenca(features, campo) {
  const perdeu = faixas.map(() => 0);
  const ganhou = faixas.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    const indice = classificar(p);
    if (indice === null || !numeroValido(p[campo])) return;
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
  const votos = faixas.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    const indice = classificar(p);
    if (indice === null || !numeroValido(p[campoBase]) || !numeroValido(p[campo])) return;
    votos[indice] += Number(p[campo]);
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
      labels: faixas.map((faixa) => faixa.rotulo),
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
        x: { title: { display: true, text: tituloEixo } },
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

function saldoPorFaixa(features, campoDif, campoBase) {
  const saldo = faixas.map(() => 0);
  const base = faixas.map(() => 0);
  features.forEach((feature) => {
    const p = feature.properties;
    const indice = classificar(p);
    if (indice === null || !numeroValido(p[campoDif]) || !numeroValido(p[campoBase])) return;
    saldo[indice] += Number(p[campoDif]);
    base[indice] += Number(p[campoBase]);
  });
  return {
    absoluto: saldo.map((valor) => Math.round(valor)),
    percentual: saldo.map((valor, indice) => (
      base[indice] > 0 ? Math.round((valor / base[indice]) * 1000) / 10 : null
    )),
  };
}

function limitesEixo(series) {
  const numeros = series.flat().filter((valor) => numeroValido(valor)).map(Number);
  const minimo = Math.min(0, ...numeros);
  const maximo = Math.max(0, ...numeros);
  return { min: minimo, max: maximo === minimo ? minimo + 1 : maximo };
}

function desenharSaldo(canvas, saldo, eixoVotos, eixoPercentual) {
  new Chart(canvas, {
    data: {
      labels: faixas.map((faixa) => faixa.rotulo),
      datasets: [
        {
          type: "bar",
          label: "Saldo em votos",
          data: saldo.absoluto,
          backgroundColor: saldo.absoluto.map((valor) => (valor < 0 ? COR_PERDA : COR_GANHO)),
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Saldo percentual",
          data: saldo.percentual,
          borderColor: COR_TOTAL,
          backgroundColor: COR_TOTAL,
          pointRadius: 3,
          tension: 0,
          yAxisID: "y1",
        },
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
              const valor = Number(contexto.raw);
              if (contexto.dataset.yAxisID === "y1") {
                return `${contexto.dataset.label}: ${valor.toLocaleString("pt-BR")}%`;
              }
              return `${contexto.dataset.label}: ${valor.toLocaleString("pt-BR")} votos`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: tituloEixo } },
        y: {
          position: "left",
          min: eixoVotos.min,
          max: eixoVotos.max,
          title: { display: true, text: "Saldo de votos (2026 − 2022)" },
          ticks: {
            callback(valor) {
              return Number(valor).toLocaleString("pt-BR");
            },
          },
        },
        y1: {
          position: "right",
          min: eixoPercentual.min,
          max: eixoPercentual.max,
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Saldo em relação a 2022 (%)" },
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

function parcela(votos) {
  const soma = votos.reduce((acumulado, valor) => acumulado + valor, 0);
  if (soma <= 0) return votos.map(() => 0);
  return votos.map((valor) => Math.round((valor / soma) * 1000) / 10);
}

function desenharLinha(canvas, series, maximo) {
  new Chart(canvas, {
    type: "line",
    data: {
      labels: faixas.map((faixa) => faixa.rotulo),
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
        x: { title: { display: true, text: tituloEixo } },
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

const COR_DEMAIS = "#78716c";

function percentuaisDaClasse(votos) {
  const nomes = Object.keys(votos);
  const soma = nomes.reduce((acumulado, nome) => acumulado + votos[nome], 0);
  if (soma <= 0) return nomes.map(() => 0);
  const percentuais = nomes.map((nome) => Math.round((votos[nome] / soma) * 1000) / 10);
  const ajuste = Math.round((100 - percentuais.reduce((acumulado, valor) => acumulado + valor, 0)) * 10) / 10;
  if (ajuste !== 0) {
    let maior = 0;
    percentuais.forEach((valor, indice) => {
      if (valor > percentuais[maior]) maior = indice;
    });
    percentuais[maior] = Math.round((percentuais[maior] + ajuste) * 10) / 10;
  }
  return percentuais;
}

function composicaoPorClasse(features, campos) {
  const acumulado = faixas.map(() => ({ lula: 0, adversario: 0, demais: 0, invalidos: 0 }));
  features.forEach((feature) => {
    const p = feature.properties;
    const indice = classificar(p);
    if (indice === null || campos.some((campo) => !numeroValido(p[campo]))) return;
    const lula = Number(p[campos[0]]);
    const adversario = Number(p[campos[1]]);
    const invalidos = Number(p[campos[2]]);
    const totais = Number(p[campos[3]]);
    const item = acumulado[indice];
    item.lula += lula;
    item.adversario += adversario;
    item.invalidos += invalidos;
    item.demais += Math.max(0, totais - lula - adversario - invalidos);
  });
  return acumulado.map((item) => ({
    votos: {
      lula: Math.round(item.lula),
      adversario: Math.round(item.adversario),
      demais: Math.round(item.demais),
      invalidos: Math.round(item.invalidos),
    },
    percentuais: percentuaisDaClasse(item),
  }));
}

function desenharEmpilhado(canvas, grupos) {
  const categorias = [
    { chave: "lula", rotulo: "Lula", cor: COR_LULA },
    { chave: "adversario", rotulo: "Bolsonaro / Flávio", cor: COR_ADVERSARIO },
    { chave: "demais", rotulo: "Demais candidatos", cor: COR_DEMAIS },
    { chave: "invalidos", rotulo: "Inválidos", cor: COR_INVALIDOS },
  ];
  const datasets = grupos.flatMap((grupo) => categorias.map((categoria) => ({
    label: categoria.rotulo,
    data: grupo.classes.map((classe) => classe.percentuais[categorias.findIndex((item) => item.chave === categoria.chave)]),
    votos: grupo.classes.map((classe) => classe.votos[categoria.chave]),
    backgroundColor: categoria.cor,
    stack: grupo.ano,
  })));

  new Chart(canvas, {
    type: "bar",
    plugins: [{
      id: "rotulosEmpilhados",
      afterDatasetsDraw(grafico) {
        const { ctx } = grafico;
        ctx.save();
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = "#1c1917";
        grafico.data.datasets.forEach((dataset, indice) => {
          const meta = grafico.getDatasetMeta(indice);
          meta.data.forEach((barra, posicao) => {
            const valor = dataset.data[posicao];
            const { x, y, base } = barra.getProps(["x", "y", "base"], true);
            if (Math.abs(base - y) < 16) return;
            const texto = `${Number(valor).toLocaleString("pt-BR")}%`;
            const meio = (y + base) / 2;
            ctx.strokeText(texto, x, meio);
            ctx.fillText(texto, x, meio);
          });
        });
        ctx.font = "11px Segoe UI, sans-serif";
        ctx.textBaseline = "top";
        grupos.forEach((grupo, indiceGrupo) => {
          const meta = grafico.getDatasetMeta(indiceGrupo * categorias.length);
          meta.data.forEach((barra) => {
            const { x } = barra.getProps(["x"], true);
            ctx.strokeText(grupo.ano, x, grafico.chartArea.bottom + 4);
            ctx.fillText(grupo.ano, x, grafico.chartArea.bottom + 4);
          });
        });
        ctx.restore();
      },
    }],
    data: {
      labels: faixas.map((faixa) => faixa.rotulo),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#1c1917",
      layout: { padding: { bottom: 4 } },
      plugins: {
        legend: {
          labels: {
            filter(item) {
              return datasets[item.datasetIndex].stack === grupos[0].ano;
            },
          },
        },
        tooltip: {
          callbacks: {
            label(contexto) {
              const percentual = Number(contexto.raw).toLocaleString("pt-BR");
              const votos = Number(contexto.dataset.votos[contexto.dataIndex]).toLocaleString("pt-BR");
              return `${contexto.dataset.stack} · ${contexto.dataset.label}: ${percentual}% (${votos} votos)`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: tituloEixo },
          ticks: { padding: 18 },
        },
        y: {
          stacked: true,
          min: 0,
          max: 100,
          title: { display: true, text: "Repartição dos votos da classe (%)" },
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

function desenharComposicao(features) {
  const grupos = [
    {
      ano: "2022",
      classes: composicaoPorClasse(features, [
        "votos_lula_2022", "votos_bolsonaro_2022", "votos_invalidos_2022", "votos_totais_2022",
      ]),
    },
    {
      ano: "2026",
      classes: composicaoPorClasse(features, [
        "votos_lula_2026", "votos_flavio_2026", "votos_invalidos_2026", "votos_totais_2026",
      ]),
    },
  ];
  desenharEmpilhado(document.getElementById("grafico-ipvs-forma-empilhada"), grupos);
}

function eixoRenda(features) {
  montarFaixas(features);
  classificar = (propriedades) => (
    numeroValido(propriedades.renda_mediana) ? indiceFaixa(Number(propriedades.renda_mediana)) : null
  );
  tituloEixo = "Renda mediana do responsável (R$)";
}

function eixoIpvs() {
  faixas = [
    { rotulo: "Baixíssima" },
    { rotulo: "Muito baixa" },
    { rotulo: "Baixa" },
    { rotulo: "Média" },
    { rotulo: "Alta" },
    { rotulo: "Muito alta" },
  ];
  classificar = (propriedades) => {
    const valor = Number(propriedades.ipvs);
    if (valor >= 1 && valor <= 6) return valor - 1;
    return null;
  };
  tituloEixo = "Classe de vulnerabilidade (IPVS)";
}

function desenharPainel(features, prefixo) {
  const canvas = (nome) => document.getElementById(`${prefixo}${nome}`);
    const lula = contar(features, "dif_pct_lula");
    const bolsonaro = contar(features, "dif_pct_bolsonaro");
    const invalidos = contar(features, "dif_pct_invalidos");
    const nc = contar(features, "dif_pct_nc");
    const maximoCelulas = maximoDe([
      lula.perdeu, lula.ganhou, bolsonaro.perdeu, bolsonaro.ganhou,
      invalidos.perdeu, invalidos.ganhou, nc.perdeu, nc.ganhou,
    ]);
    desenhar(canvas("lula"), seriesVariacao(lula), maximoCelulas, "Quantidade de células", "células");
    desenhar(canvas("bolsonaro"), seriesVariacao(bolsonaro), maximoCelulas, "Quantidade de células", "células");
    desenhar(canvas("invalidos"), seriesVariacao(invalidos), maximoCelulas, "Quantidade de células", "células");
    desenhar(canvas("nc"), seriesVariacao(nc), maximoCelulas, "Quantidade de células", "células");

    const lulaSaldo = saldoPorFaixa(features, "dif_lula", "votos_lula_2022");
    const bolsonaroSaldo = saldoPorFaixa(features, "dif_bolsonaro", "votos_bolsonaro_2022");
    const invalidosSaldo = saldoPorFaixa(features, "dif_invalidos", "votos_invalidos_2022");
    const ncSaldo = saldoPorFaixa(features, "dif_nc", "votos_nc_2022");
    const saldos = [lulaSaldo, bolsonaroSaldo, invalidosSaldo, ncSaldo];
    const eixoVotos = limitesEixo(saldos.map((item) => item.absoluto));
    const eixoPercentual = limitesEixo(saldos.map((item) => item.percentual));
    desenharSaldo(canvas("lula-votos"), lulaSaldo, eixoVotos, eixoPercentual);
    desenharSaldo(canvas("bolsonaro-votos"), bolsonaroSaldo, eixoVotos, eixoPercentual);
    desenharSaldo(canvas("invalidos-votos"), invalidosSaldo, eixoVotos, eixoPercentual);
    desenharSaldo(canvas("nc-votos"), ncSaldo, eixoVotos, eixoPercentual);

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
    desenhar(canvas("lula-total"), [
      serieAno("2022", totais[0], COR_2022),
      serieAno("2026", totais[1], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(canvas("bolsonaro-total"), [
      serieAno("2022", totais[2], COR_2022),
      serieAno("2026", totais[3], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(canvas("invalidos-total"), [
      serieAno("2022", totais[4], COR_2022),
      serieAno("2026", totais[5], COR_2026),
    ], maximoTotal, "Votos", "votos");
    desenhar(canvas("nc-total"), [
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
    desenharLinha(canvas("forma-2026"), forma2026, maximoForma);
    desenharLinha(canvas("forma-2022"), forma2022, maximoForma);
}

fetch("dados/grade.geojson?v=21")
  .then((resposta) => resposta.json())
  .then((dados) => {
    const features = dados.features;
    eixoRenda(features);
    desenharPainel(features, "grafico-");
    eixoIpvs();
    desenharPainel(features, "grafico-ipvs-");
    desenharComposicao(features);
  });
