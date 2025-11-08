<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, PointElement, LineElement } from 'chart.js'
import type { ChartData, Point, ChartDataset } from 'chart.js'
import { computed } from 'vue';
import type { DataPoint } from "@/domain/models/RLMultipleModel"

// 1. Registrar los elementos necesarios para un gráfico de dispersión con línea
ChartJS.register(Title, Tooltip, Legend, LinearScale, PointElement, LineElement)

// 2. Definición de las propiedades
const props = defineProps<{
  /** Los datos de entrada completos (X y Y) */
  dataPoints: DataPoint[]
  /** El nombre de la variable X que se está graficando (será X[0]) */
  xLabel: string
  /** El nombre de la variable Y */
  yLabel: string
  /** El intercepto (B0) */
  intercept: number
  /** El coeficiente de la variable X que se está graficando (será B1) */
  coefficient: number
}>()

// 3. Formatear los datos para Chart.js
const chartData = computed((): ChartData<'scatter', Point[]> => {
  if (!props.dataPoints || props.dataPoints.length === 0) return { datasets: [] };

  // Construir puntos asegurando que x e y sean números (no undefined)
  const points = props.dataPoints
    .map(p => ({ x: p.x[0], y: p.y }))
    .filter((pt): pt is { x: number; y: number } => typeof pt.x === 'number' && typeof pt.y === 'number');

  if (points.length === 0) return { datasets: [] };

  // Calculamos los valores mínimos y máximos de X
  const xValues = points.map(p => p.x as number);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);

  // La ecuación de la línea de regresión simple es: Y_pred = B0 + B1 * X
  const lineData: Point[] = [
    { x: minX, y: props.intercept + props.coefficient * minX },
    { x: maxX, y: props.intercept + props.coefficient * maxX },
  ];

  const datasets: ChartDataset<'scatter', Point[]>[] = [
    {
      label: `${props.yLabel} vs. ${props.xLabel}`,
      data: points,
      backgroundColor: 'rgba(25, 135, 84, 0.6)', // Verde de Bootstrap con transparencia
      pointRadius: 4,
    },
    {
      label: 'Línea de Regresión',
      data: lineData,
      type: 'line', // Es importante especificar el tipo 'line' dentro de un Scatter (mixed chart)
      borderColor: '#dc3545', // Rojo
      borderWidth: 2,
      fill: false,
      pointRadius: 0, // No mostrar puntos en la línea
    } as unknown as ChartDataset<'scatter', Point[]>
  ];

  return { datasets } as unknown as ChartData<'scatter', Point[]>;
})

// 4. Configuración de las opciones del gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: props.xLabel
      }
    },
    y: {
      title: {
        display: true,
        text: props.yLabel
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
  <div class="h-100">
    <Scatter :data="chartData" :options="chartOptions" />
  </div>
</template>
