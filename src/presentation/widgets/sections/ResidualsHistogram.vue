<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed, ref, watch, onMounted } from 'vue'; // <--- Añadido ref, watch, onMounted

// 1. Registra los elementos necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  /** Los valores de los residuos */
  residuos: number[]
}>()

// --- SOLUCIÓN: KEY para forzar la re-renderización (Recomendado para problemas de Canvas) ---
const chartKey = ref(0);
// -----------------------------------------------------------------------------------------

/**
 * Calcula el histograma (frecuencias) de los residuales.
 * @param data Los residuos
 * @param bins Número de "cubetas" o barras a usar.
 */
function calculateHistogram(data: number[], bins: number = 10): { labels: string[], values: number[] } {
  // ... (Tu lógica de calculateHistogram se mantiene igual) ...
  if (data.length === 0) return { labels: [], values: [] };

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal;

  // Calcular el tamaño de cada intervalo (bin)
  const binSize = range / bins;

  // Inicializar las cubetas a cero
  const counts = Array(bins).fill(0);
  const labels = [];

  // Rellenar las cubetas
  for (const value of data) {
    let index = Math.floor((value - minVal) / binSize);
    // Asegurarse de que el valor máximo caiga en la última cubeta
    if (index === bins) {
      index = bins - 1;
    }
    if (index >= 0 && index < bins) {
      counts[index]++;
    }
  }

  // Generar etiquetas (rango de cada cubeta)
  for (let i = 0; i < bins; i++) {
    const start = minVal + i * binSize;
    const end = start + binSize;
    labels.push(`${start.toFixed(2)} a ${end.toFixed(2)}`);
  }

  return { labels, values: counts };
}

// 2. Formatear los datos para Chart.js
const chartData = computed(() => {
  const { labels, values } = calculateHistogram(props.residuos);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Frecuencia',
        backgroundColor: '#198754', // Verde de Bootstrap
        data: values
      }
    ]
  }
})

// 3. Configuración de las opciones del gráfico
const chartOptions = {
  // ... (Tu configuración de chartOptions se mantiene igual) ...
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Residuales'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Frecuencia'
      },
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

// --- SOLUCIÓN: Lógica para forzar la actualización ---

// Forzar el re-renderizado cuando el componente se monta por primera vez
// (asegura que el Canvas existe).
onMounted(() => {
    // Esto es a menudo suficiente en Electron si el problema es la inestabilidad del DOM al inicio
    chartKey.value++;
});

// Además, si los residuos cambian, aseguramos una actualización inmediata (aunque computed ya lo hace, esto lo refuerza)
watch(
    () => props.residuos,
    () => {
        chartKey.value++;
    },
    { deep: true }
);

</script>

<template>
  <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
</template>
