<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, PointElement, LineElement, CategoryScale } from 'chart.js'
import { computed } from 'vue';

// 1. Registra los elementos necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, LinearScale, PointElement, LineElement, CategoryScale)

const props = defineProps<{
  /** Los valores de los residuos */
  residuos: number[]
}>()

/**
 * Función que genera los datos para el Gráfico Q-Q Plot.
 * Ordena los datos (cuantiles muestrales) y calcula los cuantiles teóricos.
 * @param data Los residuos.
 */
function calculateQQData(data: number[]): { sampleQuantiles: number[], theoreticalQuantiles: number[] } {
  if (data.length === 0) {
    return { sampleQuantiles: [], theoreticalQuantiles: [] };
  }

  // 1. Ordenar los residuos (Cuantiles Muestrales)
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;

  // 2. Calcular las posiciones de las probabilidades (Fórmulas de Cuantiles Teóricos)
  // Usamos la fórmula (i - 0.5) / n para evitar 0 y 1.
  const probabilities = Array.from({ length: n }, (_, i) => (i + 0.5) / n);

  // 3. Calcular los cuantiles teóricos (inversa de la CDF normal estándar)
  // Nota: La implementación de la función "cuantil normal inverso" (ppf) es compleja
  // en JS puro. Para una aproximación simple y que funcione en el entorno Canvas,
  // usaremos una librería mínima o una aproximación conocida.

  // Usaremos una aproximación robusta para la función inversa de la CDF Normal (ppf/probit)
  // Aquí usamos la aproximación de Horner/Hastings para una función phi inversa simple:
  // Fuente: A-PLot, Statistical Graphics, etc.

  const p_a: [number, number, number, number, number, number] = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.704983020626350e+01,
    5.18341620023450e+00,
  ];
  const p_b: [number, number, number, number, number, number] = [
    -5.447609879822406e+01,
    4.393581555543015e+02,
    -8.241378368817740e+02,
    7.05641776986388e+02,
    -2.797200780267270e+02,
    3.54388927471201e+01,
  ];

  const theoreticalQuantiles = probabilities.map(p => {
    // Evitar p=0 y p=1 ajustando ligeramente
    if (p < 0.0000000001) p = 0.0000000001;
    if (p > 0.9999999999) p = 0.9999999999;

    // Cuadrantes de la función
    if (p < 0.5) {
      const q = Math.sqrt(-2.0 * Math.log(p));
      const num = p_a[5] + q * (p_a[4] + q * (p_a[3] + q * (p_a[2] + q * (p_a[1] + q * p_a[0]))));
      const den = 1.0 + q * (p_b[5] + q * (p_b[4] + q * (p_b[3] + q * (p_b[2] + q * p_b[1]))));
      return num / den;
    } else {
      const q = Math.sqrt(-2.0 * Math.log(1 - p));
      const num = p_a[5] + q * (p_a[4] + q * (p_a[3] + q * (p_a[2] + q * (p_a[1] + q * p_a[0]))));
      const den = 1.0 + q * (p_b[5] + q * (p_b[4] + q * (p_b[3] + q * (p_b[2] + q * p_b[1]))));
      return -(num / den); // Es el negativo si p > 0.5
    }
  });


  return { sampleQuantiles: sortedData, theoreticalQuantiles };
}

// 4. Formatear los datos para Chart.js
const chartData = computed(() => {
  const { sampleQuantiles, theoreticalQuantiles } = calculateQQData(props.residuos);

  // Los puntos (los datos reales) - aseguramos que x/y nunca sean undefined (usar null)
  const dataPoints = sampleQuantiles.map((y, index) => ({
    x: theoreticalQuantiles[index] ?? null,
    y: y ?? null,
  }));

  // Los puntos para la línea de referencia (una línea recta de principio a fin)
  const minX = theoreticalQuantiles.length ? Math.min(...theoreticalQuantiles) : 0;
  const maxX = theoreticalQuantiles.length ? Math.max(...theoreticalQuantiles) : 0;
  const minY = sampleQuantiles.length ? Math.min(...sampleQuantiles) : 0;
  const maxY = sampleQuantiles.length ? Math.max(...sampleQuantiles) : 0;

  // Para una línea 45° que pase por los extremos de los datos
  const referenceLineData = [
    { x: minX, y: minY },
    { x: maxX, y: maxY }
  ];


  return {
    datasets: [
      {
        label: 'Cuantiles',
        data: dataPoints,
        backgroundColor: '#fd7e14', // Naranja
        pointRadius: 3,
      },
      // Línea de Referencia (Si los puntos caen sobre esta línea, son normales)
      // Usar un dataset de tipo scatter (sin `type: 'line'`) y habilitar showLine
      // para que Chart.js dibuje la línea; así respetamos el tipo "scatter".
      {
        label: 'Línea de Normalidad',
        data: referenceLineData,
        showLine: true,
        borderColor: '#dc3545', // Rojo
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      }
    ],
  }
})

// 5. Configuración de las opciones del gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Cuantiles Teóricos Normales'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Cuantiles Muestrales (Residuales)'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}
</script>

<template>
  <Scatter :data="chartData" :options="chartOptions" />
</template>
