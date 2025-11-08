<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, PointElement, LineElement, CategoryScale } from 'chart.js'
import type { ChartData, Point } from 'chart.js'
import { computed } from 'vue';

// 1. Registra los elementos necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, LinearScale, PointElement, LineElement, CategoryScale)

// 2. Definición de las propiedades que recibirá el componente
const props = defineProps<{
  /** Los valores de los residuos (Eje Y) */
  residuos: number[]
  /** Los valores predichos (Eje X) */
  predicciones: number[]
}>()

// 3. Formatear los datos para Chart.js
const chartData = computed<ChartData<'scatter', Point[]>>(() => {
  // Chart.js espera un array de objetos {x: value, y: value} para los scatter plots
  const dataPoints = props.residuos.map((residuo, index) => ({
    x: props.predicciones[index] ?? null,
    y: residuo,
  }));

  const xMin = props.predicciones.length ? Math.min(...props.predicciones) : null;
  const xMax = props.predicciones.length ? Math.max(...props.predicciones) : null;

  return {
    datasets: [
      {
        label: 'Residuales',
        data: dataPoints,
        backgroundColor: '#0d6efd', // Azul de Bootstrap
        pointRadius: 3, // Tamaño de los puntos
      },
      // Añadir una línea en y=0 para el diagnóstico (idealmente los puntos deben ser aleatorios alrededor de esta línea)
      {
        label: 'Línea de Referencia (e=0)',
        data: [{ x: xMin, y: 0 }, { x: xMax, y: 0 }],
        type: 'line',
        borderColor: '#dc3545', // Rojo
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      }
    ],
  } as unknown as ChartData<'scatter', Point[]>
})

// 4. Configuración de las opciones del gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Valores Predichos (Ŷ)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Residuales (e)'
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
