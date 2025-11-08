<script setup lang="ts">
import { ref, computed } from "vue"
import DashboardLayout from "@/presentation/layouts/DashboardLayout.vue"
import TitlePage from "../widgets/TitlePage.vue"

import { showToast } from '@/utils/toast'
import type { ClusterDataPoint, KMeansResult } from "@/domain/models/ClusterModel"
import PostKMeansTrainUseCase from "@/domain/usecase/ClusterUseCase/PostKMeansTrainUseCase"

// --- ESTADO GLOBAL DE DATOS ---
const loading = ref(false)
const result = ref<KMeansResult | null>(null)
const nClusters = ref(3) // Parámetro del modelo

/** Nombres de todas las columnas disponibles en el CSV (incluyendo encabezados). */
const availableColumns = ref<string[]>([])
/** El dataset completo cargado desde el CSV, como array de objetos (fila). */
const rawDataset = ref<ClusterDataPoint[]>([])

// --- ESTADO DE SELECCIÓN DE VARIABLES ---
/** Nombres de las columnas seleccionadas como Features. */
const selectedFeatures = ref<string[]>([])


// -----------------------------------------------------------
// --- LÓGICA DE PARSEO DE CSV Y DATOS (ADAPTACIÓN DE RLMultiple) ---
// -----------------------------------------------------------

function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '')
  if (lines.length < 2) { /* ... manejo de error ... */ }

  // 1. Detección de Separador
  // ... (Lógica de detección de delimitador, omitida por concisión, usa la de RLMultiple.vue) ...
  const delimiter = ','; // Asumimos coma por defecto

  const headerLine = lines[0]!;
  const headers = headerLine.split(delimiter).map(h => h.trim()).filter(h => h !== '');
  availableColumns.value = headers;

  // Función de Limpieza y Conversión a número
  const cleanAndParse = (value: string): number | null => {
    let cleaned = value.trim().replace(/[^0-9.,-]/g, '');
    if (cleaned === '') return null;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/,/g, '.');
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  // 2. Procesar Datos y generar el ClusterDataPoint[]
  const data: ClusterDataPoint[] = [];
  let validRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine) continue;

    const parts = currentLine.split(delimiter).map(p => p.trim());
    if (parts.length !== headers.length) continue;

    const rowData: ClusterDataPoint = {};
    let numericCount = 0;

    for (let j = 0; j < parts.length; j++) {
      const header = headers[j];
      const part = parts[j];
      const num = cleanAndParse(part ?? '');

      if (num !== null && header) {
        rowData[header] = num;
        numericCount++;
      }
      // Si no es numérico, no lo agregamos a rowData, ya que el clustering solo usa números.
    }

    // Una fila es válida si tiene al menos dos columnas numéricas
    if (numericCount >= 2) {
      data.push(rowData);
      validRows++;
    }
  }

  rawDataset.value = data;
  if (validRows > 0) {
    showToast(`Archivo cargado: ${headers.length} columnas, ${validRows} filas con datos numéricos válidos.`, 'success');
  } else {
    showToast('No se encontraron filas con datos numéricos válidos (mínimo 2 columnas por fila).', 'error');
    availableColumns.value = [];
  }
}

/**
 * Maneja la selección del archivo por el usuario.
 */
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !file.name.endsWith('.csv')) {
    showToast('Por favor, sube un archivo con formato CSV.', 'error');
    target.value = '';
    return;
  }

  selectedFeatures.value = [];
  rawDataset.value = [];
  availableColumns.value = [];
  result.value = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) parseCSV(text);
  };
  reader.onerror = () => showToast('Error al leer el archivo.', 'error');
  reader.readAsText(file);
}

// -----------------------------------------------------------
// --- LÓGICA DE PROCESAMIENTO Y CONSUMO ---
// -----------------------------------------------------------

/**
 * Prepara los datos finales (solo las features seleccionadas) para el backend.
 */
const processedDataPoints = computed<ClusterDataPoint[]>(() => {
  if (selectedFeatures.value.length < 2 || rawDataset.value.length === 0) {
    return [];
  }

  // Filtrar rawDataset para asegurar que cada ClusterDataPoint solo tenga las features seleccionadas
  return rawDataset.value.map(point => {
    const filteredPoint: ClusterDataPoint = {};
    selectedFeatures.value.forEach(feature => {
      // Aseguramos que solo se incluyan las variables seleccionadas y que sean números
      if (point[feature] !== undefined && typeof point[feature] === 'number') {
        filteredPoint[feature] = point[feature];
      }
    });
    return filteredPoint;
  }).filter(point => {
    // Aseguramos que el punto tiene TODAS las features seleccionadas
    return Object.keys(point).length === selectedFeatures.value.length;
  });
});

// Columnas disponibles que NO están ya seleccionadas
const remainingColumns = computed<string[]>(() => {
  return availableColumns.value.filter(col => !selectedFeatures.value.includes(col));
});

/**
 * Función principal para ejecutar el entrenamiento.
 */
async function entrenarCluster() {
  const data = processedDataPoints.value;

  if (data.length < 5) {
    showToast('Se requieren al menos 5 puntos de datos y 2 features seleccionadas.', 'error');
    return;
  }

  loading.value = true
  result.value = null

  try {
    const requestData = {
      data: data,
      features: selectedFeatures.value,
      n_clusters: nClusters.value
    };

    const response = await PostKMeansTrainUseCase.ejecutar(requestData);
    if (response) {
      result.value = response;
      showToast(`Modelo K-Means entrenado con éxito. Se encontraron ${response.n_clusters} clusters.`, 'success');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Manejo de errores desde el UseCase (y el Service)
    showToast(e.message || 'Error desconocido al entrenar el modelo.', 'error');
    result.value = null;
  } finally {
    loading.value = false;
  }
}

// Lógica para mover variables entre las listas
function addToFeatures(variable: string) {
  if (variable && !selectedFeatures.value.includes(variable)) {
    selectedFeatures.value.push(variable);
  }
}

function removeFromFeatures(variable: string) {
  selectedFeatures.value = selectedFeatures.value.filter(v => v !== variable);
}
</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="Clustering K-Means" size="medium" class="flex-shrink-0 mb-0" />

        <button class="btn btn-success px-4 fw-bold shadow-sm" @click="entrenarCluster"
          :disabled="loading || processedDataPoints.length < 5 || selectedFeatures.length < 2">
          {{ loading ? 'Clustering...' : 'Entrenar Modelo' }}
        </button>
      </div>

      <div class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold text-dark mb-4">Carga y Configuración del Clustering</h4>

        <div class="mb-5">
          <p class="text-muted mb-3 fw-bold" style="font-size: 13px;">Paso 1: Importar Data (.csv)</p>
          <input type="file" @change="handleFileUpload" class="form-control" accept=".csv, text/csv" />
          <p v-if="rawDataset.length > 0" class="mt-2 small text-muted">
            Archivo cargado con éxito. Filas con datos numéricos válidos: <strong>{{ rawDataset.length }}</strong>.
          </p>
        </div>

        <div v-if="availableColumns.length > 0" class="row g-4 align-items-stretch">
          <p class="text-muted mt-3 fw-bold mb-1" style="font-size: 13px;">Paso 2: Seleccionar Features y Clusters</p>

          <div class="col-12 col-lg-4">
            <div class="card p-3 border-1 h-100 bg-light">
              <p class="fw-bold text-secondary mb-3">Parámetros</p>
              <label for="nClusters" class="form-label fw-bold small text-muted">Número de Clusters (K)</label>
              <input type="number" id="nClusters" class="form-control" v-model.number="nClusters" min="2" max="10">
              <p class="small text-muted mt-2">Valor típico: 3 o 4.</p>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="card h-100 p-3 border-1">
              <p class="fw-bold text-secondary mb-3">Variables Disponibles: {{ remainingColumns.length }}</p>
              <ul class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
                <li v-for="col in remainingColumns" :key="col"
                  class="list-group-item d-flex justify-content-between align-items-center p-2">
                  <span class="text-truncate">{{ col }}</span>
                  <button @click="addToFeatures(col)" class="btn btn-sm btn-outline-success"
                    style="border-radius: 1.5rem;" title="Mover a Features">X</button>
                </li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="card flex-grow-1 p-3 border-1 h-100">
              <h6 class="fw-bold text-success mb-2">Features Seleccionadas - {{ selectedFeatures.length }}</h6>
              <ul v-if="selectedFeatures.length > 0" class="list-group list-group-flush overflow-auto"
                style="max-height: 300px;">
                <li v-for="col in selectedFeatures" :key="col"
                  class="list-group-item d-flex justify-content-between align-items-center p-2">
                  <span class="text-truncate">{{ col }}</span>
                  <button @click="removeFromFeatures(col)" class="btn btn-sm btn-outline-danger" title="Quitar"
                    style="border-radius: 1.5rem;"><i class="bi bi-trash"></i></button>
                </li>
              </ul>
              <p v-else class="text-muted small mb-0">Selecciona al menos dos variables (features).</p>
            </div>
          </div>
        </div>

        <p v-if="availableColumns.length > 0" class="mt-4 small text-end text-muted">
          <strong>{{ processedDataPoints.length }}</strong> puntos de datos listos para el clustering.
        </p>

      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Calculando los clusters...</p>
      </div>

      <div v-if="result" class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold mb-4">Resultados del Clustering K-Means</h4>

        <div class="row mb-5 g-4">
          <div class="col-12 col-md-6">
            <div class="card bg-success bg-opacity-10 p-4 text-center h-100 d-flex justify-content-center">
              <h5 class="card-title text-success fw-bold mb-0">Clusters Encontrados (K)</h5>
              <p class="display-4 fw-bolder text-success mb-0">{{ result.n_clusters }}</p>
              <p class="small text-muted mt-1">
                Entrenado con <strong>{{ result.filas_entrenadas }}</strong> filas usando las features: **{{
                  result.características.join(', ') }}**.
              </p>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <p class="fw-semibold text-muted mb-3" style="font-size: 13px;">Distribución de Clusters</p>
            <table class="table table-bordered table-striped table-sm small">
              <thead class="bg-light">
                <tr>
                  <th>Cluster ID</th>
                  <th class="text-end">Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(count, id) in result.distribución_clusters" :key="id">
                  <td>Cluster {{ id }}</td>
                  <td class="text-end">{{ count }} ({{ ((count / result.filas_entrenadas) * 100).toFixed(1) }}%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="fw-semibold text-muted mb-3" style="font-size: 13px;">Coordenadas de los Centroides (Medias de
          Cluster)</p>
        <div class="table-responsive mb-5">
          <table class="table table-bordered table-striped table-hover small">
            <thead class="bg-light">
              <tr>
                <th>Cluster ID</th>
                <th v-for="(feature, index) in result.características" :key="index" class="text-end">{{ feature }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(centroid, clusterIndex) in result.centroides" :key="clusterIndex">
                <td>Cluster {{ clusterIndex }}</td>
                <td v-for="(value, featureIndex) in centroid" :key="featureIndex" class="text-end font-monospace">
                  {{ value.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="small text-muted mt-2">Estos valores representan el centro de cada cluster en las unidades
            originales de tus datos.</p>
        </div>

        <p class="fw-semibold text-muted mb-3" style="font-size: 13px;">Muestra de Datos Etiquetados</p>
        <div class="table-responsive">
          <table class="table table-bordered table-striped table-sm table-hover small">
            <thead class="bg-light">
              <tr>
                <th v-for="(feature, index) in result.características" :key="index">{{ feature }}</th>
                <th>Cluster</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(point, index) in result.muestra_etiquetada" :key="index">
                <td v-for="(feature, fIndex) in result.características" :key="fIndex" class="font-monospace">{{
                  point[feature] }}</td>
                <td class="fw-bold text-center" :class="`text-cluster-${point.cluster}`">
                  {{ point.cluster }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Estilos para diferenciar visualmente los clusters */
.text-cluster-0 {
  color: #0d6efd;
}

/* Azul */
.text-cluster-1 {
  color: #dc3545;
}

/* Rojo */
.text-cluster-2 {
  color: #ffc107;
}

/* Amarillo */
.text-cluster-3 {
  color: #198754;
}

/* Verde */
.text-cluster-4 {
  color: #6f42c1;
}

/* Púrpura */
</style>
