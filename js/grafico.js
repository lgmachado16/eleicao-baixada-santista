const PALETA = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628", "#f781bf", "#666666", "#1b9e77"];

function reta(pontos) {
  const n = pontos.length;
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  pontos.forEach((ponto) => {
    sx += ponto.x;
    sy += ponto.y;
    sxx += ponto.x * ponto.x;
    sxy += ponto.x * ponto.y;
  });
  const denominador = n * sxx - sx * sx;
  if (denominador === 0) return null;
  const inclinacao = (n * sxy - sx * sy) / denominador;
  const intercepto = (sy - inclinacao * sx) / n;
  const xs = pontos.map((ponto) => ponto.x);
  const minimo = Math.min(...xs);
  const maximo = Math.max(...xs);
  return [
    { x: minimo, y: inclinacao * minimo + intercepto },
    { x: maximo, y: inclinacao * maximo + intercepto },
  ];
}

fetch("dados/grade.geojson")
  .then((resposta) => resposta.json())
  .then((dados) => {
    const porMunicipio = new Map();
    dados.features.forEach((feature) => {
      const p = feature.properties;
      if (p.dif_pct_lula === null || p.renda_mediana === null || !p.nm_mun) return;
      const lista = porMunicipio.get(p.nm_mun) || [];
      lista.push({ x: Number(p.renda_mediana), y: Number(p.dif_pct_lula) * 100 });
      porMunicipio.set(p.nm_mun, lista);
    });
    const nomes = [...porMunicipio.keys()].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const series = nomes.flatMap((nome, indice) => {
      const cor = PALETA[indice % PALETA.length];
      const pontos = porMunicipio.get(nome);
      const linha = reta(pontos);
      const saida = [{
        label: nome,
        data: pontos,
        backgroundColor: cor,
        pointRadius: 4,
        showLine: false,
      }];
      if (linha) {
        saida.push({
          label: `${nome} tendência`,
          data: linha,
          borderColor: cor,
          borderWidth: 2,
          pointRadius: 0,
          showLine: true,
          tension: 0,
        });
      }
      return saida;
    });
    const grafico = document.getElementById("grafico");
    new Chart(grafico, {
      type: "scatter",
      data: { datasets: series },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: "#1c1917",
        plugins: {
          legend: {
            labels: {
              filter: (item) => !String(item.text).includes("tendência"),
            },
          },
          tooltip: {
            callbacks: {
              label(contexto) {
                const ponto = contexto.raw;
                return `${contexto.dataset.label}: renda ${ponto.x.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}, variação ${ponto.y.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p.`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Renda mediana do responsável (R$)" },
          },
          y: {
            title: { display: true, text: "Variação de Lula, 2026 menos 2022 (pontos percentuais)" },
          },
        },
      },
    });
  });
