<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts"
import type { ApexOptions } from "apexcharts"
import { ref, computed } from "vue"
// Asume que estas rutas son correctas en tu proyecto
import DashboardLayout from "@/presentation/layouts/DashboardLayout.vue"
import PostSentimientosUseCase from "@/domain/usecase/SentimientosUseCase/PostSentimientosUseCase"
// Asegúrate de que este modelo incluya el campo `palabras_clave: KeywordResult[]`
import type { SentimientosModel } from "@/domain/models/SentimientosModel"
import TitlePage from "../widgets/TitlePage.vue"
// Importamos showToast para asegurar que esté disponible
import { showToast } from '@/utils/toast'

// --- ESTADO REACTIVO ---
const videoUrl = ref("")
const loading = ref(false)
const result = ref<SentimientosModel | null>(null)
// Cantidad de comentarios a analizar.
const commentsToAnalyze = ref(200)

// Extraer ID del video para usar embed
const videoId = computed(() => {
  const match = videoUrl.value.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})

// --- GRÁFICO 1: Sentimientos (Barra Vertical) ---
const chartData = computed(() => {
  if (!result.value) return []
  const sentimientoMap: { [key: string]: string } = {
    'negativo': 'Negativo',
    'neutral': 'Neutral',
    'positivo': 'Positivo'
  };
  return Object.entries(result.value.conteo).map(([sentimiento, cantidad]) => ({
    x: sentimientoMap[sentimiento] || sentimiento,
    y: cantidad
  }))
})

const chartOptions: ApexOptions = {
  chart: { type: "bar", toolbar: { show: false }, height: 300 },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ endingShape: 'rounded' } as any)
    },
  },
  xaxis: {
    type: "category",
    labels: { style: { colors: ["#6c757d"] } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { labels: { formatter: (val) => val.toFixed(0) } },
  dataLabels: { enabled: false },
  grid: { show: false },
  colors: ["#dc3545", "#ffc107", "#007bff"],
  title: {
    text: "Distribución de Sentimientos",
    align: 'left',
    style: { fontSize: '18px', fontWeight: '600', color: '#343a40' }
  },
  tooltip: { y: { formatter: (val) => val.toFixed(0) + " comentarios" } }
}


// --- GRÁFICO 2: Palabras Clave (Torta/Donut) ---

// Series (valores numéricos de los conteos)
const donutChartSeries = computed(() => {
  if (!result.value || !result.value.palabras_clave) return []
  // Solo mostramos las series si hay datos
  return result.value.palabras_clave.map(item => item.count)
})

// Labels (las palabras)
const donutChartLabels = computed(() => {
  if (!result.value || !result.value.palabras_clave) return []
  return result.value.palabras_clave.map(item => item.word)
})

const donutChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'donut', height: 350 },
  labels: donutChartLabels.value, // Usamos las palabras como etiquetas
  dataLabels: { enabled: true },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }
  ],
  title: {
    text: "Palabras Clave más Usadas",
    align: 'left',
    style: { fontSize: '18px', fontWeight: '600', color: '#343a40' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%', // Hace el gráfico tipo Donut
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Palabras',
            formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString()
          }
        }
      }
    }
  }
}))

// --- LÓGICA DE ANÁLISIS (Se mantiene) ---
async function analizar() {
  if (!videoUrl.value) {
    showToast('Por favor, ingresa una URL de YouTube.', 'error');
    return
  }

  // Validar que el límite sea un número positivo
  const limit = parseInt(String(commentsToAnalyze.value))
  if (isNaN(limit) || limit <= 0) {
    showToast("Por favor, ingresa un número de comentarios válido (> 0).", 'error');
    return
  }

  loading.value = true
  result.value = null

  // ✅ CORRECTO: Pasamos el límite al caso de uso
  const data = await PostSentimientosUseCase.ejecutar(videoUrl.value, limit)
  if (data) result.value = { ...data, url: videoUrl.value }

  loading.value = false
}

// Función auxiliar para mostrar metadatos de forma limpia (Se mantiene)
const formatMeta = (label: string, value: string | number | boolean) => {
  let formattedValue: string;
  if (typeof value === 'number') { formattedValue = value.toLocaleString(); }
  else if (typeof value === 'string') { formattedValue = value; }
  else { formattedValue = String(value); }
  return { label, value: formattedValue };
};
</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="Análisis de Sentimientos" size="medium" class="flex-shrink-0 mb-0" />

        <div class="d-flex gap-2 flex-grow-1" style="max-width: 600px;">
          <div class="input-group input-group-sm rounded-pill overflow-hidden shadow-sm flex-shrink-0"
            style="max-width: 120px;">
            <input v-model.number="commentsToAnalyze" type="number" min="1" class="form-control border-0 text-center"
              placeholder="# Coment." title="Cantidad de comentarios a analizar" />
          </div>

          <div class="input-group input-group-sm rounded-pill overflow-hidden shadow-sm flex-grow-1">
            <input v-model="videoUrl" class="form-control border-0 ps-3"
              placeholder="Pega la URL del video de YouTube..." type="url" />
            <button class="btn btn-primary px-3 fw-bold" @click="analizar" :disabled="loading">
              {{ loading ? 'Analizando...' : 'Analizar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Analizando el video, por favor espera...</p>
      </div>

      <div v-if="result" class="card border-0 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <div class="row g-5">
          <div class="col-12 col-lg-5">
            <div class="ratio ratio-16x9 mb-4">
              <iframe v-if="videoId" :src="`https://www.youtube.com/embed/${videoId}`" frameborder="0" allowfullscreen
                class="rounded-4 shadow-sm" title="Video de YouTube"></iframe>
              <img v-else :src="result.miniatura" :alt="result.titulo_video || 'Miniatura del video'"
                class="rounded-4 shadow-sm w-100 object-fit-cover" />
            </div>

            <h4 class="fw-bold text-dark mb-1">{{ result.titulo_video }}</h4>
            <p class="text-primary fw-medium mb-3">{{ result.canal }}</p>

            <h6 class="mt-4 mb-3 text-muted">Métricas del Video</h6>
            <div class="list-group list-group-flush">
              <div class="d-flex justify-content-between py-1 border-bottom" v-for="meta in [
                formatMeta('Comentarios Analizados', result.total_comentarios),
                formatMeta('Total en YouTube', result.total_comentarios_video),
                formatMeta('Vistas', result.vistas),
                formatMeta('Likes', result.likes),
                formatMeta('Publicado', result.fecha_publicacion.split('T')[0] ?? 'Fecha desconocida'),
              ]" :key="meta.label">
                <span class="text-muted fw-normal">{{ meta.label }}</span>
                <span class="fw-medium text-dark">{{ meta.value }}</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <h3 class="mb-4 text-dark fw-bold">Análisis de Sentimientos</h3>
            <div class="bg-white p-3 rounded-3 shadow-sm">
              <VueApexCharts width="100%" height="300" type="bar" :options="chartOptions"
                :series="[{ name: 'Comentarios', data: chartData }]" />
            </div>
            <p class="text-muted mt-3 small">
              Distribución del volumen total de <strong>{{
                result.total_comentarios.toLocaleString() }}</strong>
              comentarios analizados.
            </p>
          </div>
        </div>

        <hr class="my-5">

        <h3 class="mb-4 text-dark fw-bold">Análisis de Palabras Clave</h3>

        <div class="row g-4">

          <div class="col-12 col-lg-5">
            <div class="bg-white p-3 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-center">
              <VueApexCharts v-if="donutChartSeries.length > 0" width="100%" height="350" type="donut"
                :options="donutChartOptions" :series="donutChartSeries" />
              <p v-else class="text-center text-muted py-5">
                No se encontraron palabras clave relevantes.
              </p>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-header bg-primary text-white fw-bold py-2">
                Frecuencia de las Palabras Top
              </div>

              <div v-if="result.palabras_clave && result.palabras_clave.length > 0"
                class="list-group list-group-flush small">
                <div class="list-group-item d-flex justify-content-between fw-bold text-muted py-1">
                  <span>Palabra</span>
                  <span style="min-width: 80px; text-align: right;">Cantidad</span>
                </div>
                <div class="list-group-item d-flex justify-content-between py-1"
                  v-for="(keyword, index) in result.palabras_clave" :key="index">
                  <span class="text-dark">{{ keyword.word }}</span>
                  <span class="fw-medium text-primary" style="min-width: 80px; text-align: right;">{{
                    keyword.count.toLocaleString() }}</span>
                </div>
              </div>
              <div v-else class="card-body text-center text-muted">
                <p>No hay datos de palabras clave disponibles para mostrar.</p>
              </div>
            </div>
          </div>
        </div>
        <p class="text-muted mt-3 small">
          Frecuencia de las palabras más comunes en los comentarios (excluyendo "stopwords"), visualizada en un gráfico
          de torta.
        </p>

      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
export default {
  // Aseguramos que VueApexCharts se exporte correctamente
  components: { VueApexCharts }
}
</script>
