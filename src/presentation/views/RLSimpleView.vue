<script setup lang="ts">
import { ref, computed } from "vue"
import DashboardLayout from "@/presentation/layouts/DashboardLayout.vue"
import TitlePage from "../widgets/TitlePage.vue"
// 🚨 CAMBIO CLAVE: Usamos el UseCase de Regresión Simple
import PostRLSimpleUseCase from "@/domain/usecase/RLSimpleUseCase/PostRLSimpleUseCase"
import type { RLMultipleResult, DataPoint } from "@/domain/models/RLMultipleModel"
import { showToast } from '@/utils/toast'
import ResidualsScatterPlot from "@/presentation/widgets/sections/ResidualsScatterPlot.vue"
import ResidualsHistogram from "../widgets/sections/ResidualsHistogram.vue"
import ResidualsQQPlot from "../widgets/sections/ResidualsQQPlot.vue"
import ScatterRegressionPlot from "../widgets/sections/ScatterRegressionPlot.vue"

// --- ESTADO GLOBAL DE DATOS ---
const loading = ref(false)
const result = ref<RLMultipleResult | null>(null)
const availableColumns = ref<string[]>([])
const rawDataset = ref<number[][]>([])

// --- ESTADO DE SELECCIÓN DE VARIABLES (Estilo JASP/Jamovi) ---
const dependentVariable = ref<string | null>(null)
const independentVariables = ref<string[]>([])


// -----------------------------------------------------------
// --- LÓGICA DE CARGA Y PARSEO DE CSV (MANTENIDA) ---
// -----------------------------------------------------------

function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '')

  if (lines.length < 2) {
    showToast('El archivo CSV debe tener encabezados y al menos una fila de datos.', 'error');
    availableColumns.value = [];
    rawDataset.value = [];
    return;
  }

  const firstDataLine = lines[1]!;
  const headerLine = lines[0]!;

  let delimiter = ',';
  if (firstDataLine.split(';').length > firstDataLine.split(',').length) {
    delimiter = ';';
  }

  const cleanAndParse = (value: string): number | null => {
    let cleaned = value.trim();

    if (cleaned === '') return null;

    cleaned = cleaned.replace(/[^0-9.,-]/g, '');

    if (cleaned.includes(',') && cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/,/g, '.');
    }

    const num = parseFloat(cleaned);

    if (!isNaN(num)) {
      return num;
    }

    return null;
  };

  const headers = headerLine.split(delimiter).map(h => h.trim());
  availableColumns.value = headers;

  const data: number[][] = [];
  let validRows = 0;

  const numericColumns = ['Compro', 'Debe', 'Haber', 'Tipcam'];
  const numericIndices = headers
    .map((name, index) => numericColumns.includes(name) ? index : -1)
    .filter(index => index !== -1);


  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine) continue;

    const parts = currentLine.split(delimiter).map(p => p.trim());

    if (parts.length !== headers.length) continue;

    const numericParts: number[] = [];
    let rowIsValid = true;

    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      let num: number | null = null;

      if (numericIndices.includes(j)) {
        num = cleanAndParse(part ?? '');

        if (num === null) {
          rowIsValid = false;
          break;
        }
      }

      if (num === null) {
        num = 0;
      }
      numericParts.push(num);
    }

    if (rowIsValid) {
      data.push(numericParts);
      validRows++;
    }
  }

  rawDataset.value = data;
  if (validRows > 0) {
    showToast(`Archivo cargado: ${headers.length} columnas, ${validRows} filas de datos numéricos válidos.`, 'success');
  } else {
    showToast('Se cargaron encabezados, pero no se encontraron filas con datos numéricos válidos.', 'error');
    availableColumns.value = [];
  }
}
/**
 * Maneja la selección del archivo por el usuario.
 */
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    showToast('Por favor, sube un archivo con formato CSV.', 'error');
    target.value = '';
    return;
  }

  // Resetear estados
  dependentVariable.value = null;
  independentVariables.value = [];
  rawDataset.value = [];
  availableColumns.value = [];

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      parseCSV(text);
    }
  };
  reader.onerror = () => {
    showToast('Error al leer el archivo.', 'error');
  };
  reader.readAsText(file);
}

// -----------------------------------------------------------
// --- LÓGICA DE PROCESAMIENTO BASADA EN SELECCIÓN (MANTENIDA) ---
// -----------------------------------------------------------

/**
 * Combina la selección de variables y el rawDataset para generar el DataPoint[]
 * que la API necesita.
 */
const processedDataPoints = computed<DataPoint[]>(() => {
  if (!dependentVariable.value || independentVariables.value.length === 0 || rawDataset.value.length === 0) {
    return [];
  }

  const allColumns = availableColumns.value;
  const yIndex = allColumns.findIndex(col => col === dependentVariable.value);
  const xIndices = independentVariables.value.map(xName => allColumns.findIndex(col => col === xName));

  if (yIndex === -1 || xIndices.some(idx => idx === -1)) {
    console.error("Índices de columna no encontrados. ¿Variables eliminadas?");
    return [];
  }

  const dataPoints: DataPoint[] = [];

  rawDataset.value.forEach(row => {
    const yValue = row[yIndex];
    const xValues = xIndices.map(idx => row[idx]);

    if (typeof yValue === 'number' && xValues.every(v => typeof v === 'number')) {
      dataPoints.push({ x: xValues, y: yValue });
    }
  });

  return dataPoints;
});

// Columnas disponibles que NO están ya seleccionadas
const remainingColumns = computed<string[]>(() => {
  return availableColumns.value.filter(col =>
    col !== dependentVariable.value &&
    !independentVariables.value.includes(col)
  );
});


// -----------------------------------------------------------
// --- LÓGICA DE CONSUMO Y RESTRICCIÓN RLS (MODIFICADA) ---
// -----------------------------------------------------------

async function analizar() {
  const dataPoints = processedDataPoints.value

  if (dataPoints.length < 3) {
    showToast('Se requieren al menos 3 puntos de datos y variables seleccionadas para el análisis.', 'error');
    return
  }

  // 🚨 RESTRICCIÓN CLAVE RLS: Solo una variable X
  if (independentVariables.value.length !== 1) {
    showToast('La Regresión Lineal Simple requiere seleccionar exactamente una Variable Independiente (X).', 'error');
    return
  }

  loading.value = true
  result.value = null

  // Usamos el UseCase de RLS
  const data = await PostRLSimpleUseCase.ejecutar(dataPoints, independentVariables.value)
  if (data) result.value = data

  loading.value = false
}

// Lógica para mover variables entre las listas (Estilo JASP/Jamovi)

function moveToDependent(variable: string) {
  dependentVariable.value = variable;
  // Si la variable estaba en las independientes, la quitamos
  independentVariables.value = independentVariables.value.filter(v => v !== variable);
}

function addToIndependent(variable: string) {
  // 🚨 RESTRICCIÓN DE LA VISTA: Bloquear si ya hay una X seleccionada
  if (independentVariables.value.length >= 1) {
    showToast('La Regresión Lineal Simple solo permite una variable X. Elimine la actual si desea cambiarla.', 'error');
    return;
  }

  if (variable && !independentVariables.value.includes(variable)) {
    independentVariables.value.push(variable);
  }
  // Si la variable era la dependiente, la quitamos
  if (dependentVariable.value === variable) {
    dependentVariable.value = null;
  }
}

function removeFromIndependent(variable: string) {
  independentVariables.value = independentVariables.value.filter(v => v !== variable);
}
</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="Regresión Lineal Simple" size="medium" class="flex-shrink-0 mb-0" />

        <button class="btn btn-primary px-4 fw-bold shadow-sm" @click="analizar"
          :disabled="loading || processedDataPoints.length < 3 || independentVariables.length !== 1">
          {{ loading ? 'Calculando...' : 'Ejecutar' }}
        </button>
      </div>

      <div class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold text-dark mb-4">Carga y Configuración de Variables</h4>

        <div class="mb-5">
          <p class="text-muted mb-3 fw-bold" style="font-size: 13px;">Paso 1: Importar Data (.csv)</p>
          <input type="file" @change="handleFileUpload" class="form-control" accept=".csv, text/csv" />
          <p v-if="rawDataset.length > 0" class="mt-2 small text-muted">
            Archivo cargado con éxito. Filas válidas: <strong>{{ rawDataset.length }}</strong>. Columnas: <strong>{{
              availableColumns.length }}.</strong>
            <span v-if="rawDataset.length === 0" class="text-danger fw-bold">Verifica si el archivo usa comas (,) o
              punto y coma (;) como separador de columnas, o si los decimales usan comas (,) en lugar de puntos
              (.).</span>
          </p>
        </div>

        <div v-if="availableColumns.length > 0" class="row g-4 align-items-stretch">
          <p class="text-muted mt-3 fw-bold mb-1" style="font-size: 13px;">Paso 2: Seleccionar Variables</p>

          <div class="col-12 col-lg-4">
            <div class="card h-100 p-3 border-1">
              <p class="fw-bold text-secondary mb-3">Variables Disponibles: {{ remainingColumns.length }}</p>
              <ul class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
                <li v-for="col in remainingColumns" :key="col"
                  class="list-group-item d-flex justify-content-between align-items-center p-2">
                  <span class="text-truncate">{{ col }}</span>
                  <div>
                    <button @click="moveToDependent(col)" class="btn btn-sm btn-outline-info me-1"
                      style="border-radius: 1.5rem;" title="Mover a Dependiente">Y</button>
                    <button @click="addToIndependent(col)" class="btn btn-sm btn-outline-success"
                      :disabled="independentVariables.length >= 1" style="border-radius: 1.5rem;"
                      title="Mover a Independientes">X</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-lg-8">
            <div class="d-flex flex-column h-100">

              <div class="card mb-3 p-3 border-1">
                <h6 class="fw-bold text-info mb-2">Variable Dependiente - Y</h6>
                <div v-if="dependentVariable"
                  class="list-group-item d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <span class="fw-bold">{{ dependentVariable }}</span>
                  <button @click="dependentVariable = null" class="btn btn-sm btn-outline-danger"
                    style="border-radius: 1.5rem;" title="Quitar"><i class="bi bi-trash"></i></button>
                </div>
                <p v-else class="text-muted small mb-0">Selecciona una variable</p>
              </div>

              <div class="card flex-grow-1 p-3 border-1">
                <h6 class="fw-bold text-success mb-2">Variable Independiente - X (1 Requerida)</h6>
                <ul v-if="independentVariables.length > 0" class="list-group list-group-flush">
                  <li v-for="col in independentVariables" :key="col"
                    class="list-group-item d-flex justify-content-between align-items-center p-2">
                    <span class="text-truncate">{{ col }}</span>
                    <button @click="removeFromIndependent(col)" class="btn btn-sm btn-outline-danger" title="Quitar"
                      style="border-radius: 1.5rem;"><i class="bi bi-trash"></i></button>
                  </li>
                </ul>
                <p v-else class="text-muted small mb-0">Selecciona la variable predictora X</p>
              </div>
            </div>
          </div>
        </div>

        <p v-if="availableColumns.length > 0" class="mt-4 small text-end text-muted">
          <strong>{{ processedDataPoints.length }}</strong> puntos de datos listos para el análisis.
        </p>

      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Calculando el modelo de regresión simple...</p>
      </div>

      <div v-if="result" class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold mb-4">Resultados del Análisis de Regresión Simple</h4>

        <div class="row mb-5 g-4">

          <div class="col-12 col-lg-8">
            <div class="card bg-light border-1 p-4 h-100">
              <p class="card-title text-muted fw-bold" style="font-size: 13px;">Ecuación de Regresión Estimada</p>
              <p class="card-text fs-5 font-monospace text-dark">{{ result.ecuacion }}</p>
              <p class="small text-muted mt-2">
                Ecuación: $Y = B_0 + B_1 * X$. Permite predecir la variable Y <strong>{{ dependentVariable }}</strong>
                en función de <strong>{{ independentVariables[0] }}</strong>.
              </p>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="card border-1 bg-info bg-opacity-10 p-4 text-center h-100 d-flex justify-content-center">
              <h5 class="card-title text-info fw-bold mb-0">R-Cuadrado (R²)</h5>
              <p class="display-4 fw-bolder text-info mb-0">{{ result.r2.toFixed(4) }}</p>
              <p class="small text-muted mt-1">
                El <strong>{{ (result.r2 * 100).toFixed(2) }}%</strong> de la variabilidad de Y es explicado por el
                modelo.
              </p>
            </div>
          </div>
        </div>

        <p class="fw-semibold text-muted mb-3" style="font-size: 13px;">Tabla de Coeficientes</p>
        <div class="table-responsive mb-5">
          <table class="table table-bordered table-striped table-hover small">
            <thead class="bg-light">
              <tr>
                <th>Variable</th>
                <th class="text-end">Coeficiente (B)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Intercepto (B0)</td>
                <td class="text-end font-monospace">{{ result?.coeficientes?.[0]?.toFixed(4) ?? 0 }}</td>
              </tr>
              <tr v-for="(name, index) in result.nombres_variables" :key="index">
                <td>{{ name }} (B{{ index + 1 }})</td>
                <td class="text-end font-monospace">{{ result?.coeficientes?.[index + 1]?.toFixed(4) ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="result" class="card border-0 rounded-0 p-0 p-0 mt-0 card-custom-shadow">
          <h4 class="fw-bold text-muted mb-4" style="font-size: 13px;">Diagnóstico y Gráficos del Modelo</h4>
          <div class="row g-4">

            <div class="col-12">
              <div class="card p-3 border-1">
                <h6 class="fw-bold mb-3">Gráfico de Dispersión y Línea de Regresión</h6>
                <div style="height: 400px;">
                  <ScatterRegressionPlot v-if="result.nombres_variables.length === 1" :dataPoints="result.datos_entrada"
                    :xLabel="result.nombres_variables[0] ?? ''" :yLabel="dependentVariable!"
                    :intercept="result.coeficientes[0] ?? 0" :coefficient="result.coeficientes[1] ?? 0" />
                </div>
                <p class="text-muted small mt-2">Muestra la relación entre la Variable Dependiente (Y) y la única
                  Variable Predictora (X), incluyendo la línea de regresión simple estimada.</p>
              </div>
            </div>

            <div class="col-12 col-lg-6">
              <div class="card p-3 border-1 h-100">
                <h6 class="fw-bold mb-3">Residuales vs. Predicciones</h6>
                <div style="height: 300px;">
                  <ResidualsScatterPlot :residuos="result.residuos" :predicciones="result.predicciones" v-if="result" />
                </div>
                <p class="text-muted small">Muestra si los residuales tienen un patrón (Heterocedasticidad).</p>
              </div>
            </div>

            <div class="col-12 col-lg-6">
              <div class="card p-3 border-1 h-100">
                <h6 class="fw-bold mb-3">Histograma de Residuales</h6>
                <div style="height: 300px;">
                  <ResidualsHistogram :residuos="result.residuos" v-if="result" />
                </div>
                <p class="text-muted small">Verifica si los errores se distribuyen normalmente (media 0).</p>
              </div>
            </div>

            <div class="col-12 col-lg-6">
              <div class="card p-3 border-1 h-100">
                <h6 class="fw-bold mb-3">Grafico Cuantil-Cuantil (Q-Q Plot) de Residuales</h6>
                <div style="height: 300px;">
                  <ResidualsQQPlot :residuos="result.residuos" v-if="result" />
                </div>
                <p class="text-muted small mt-2">La prueba más precisa de normalidad. Los puntos deben caer cerca de la
                  línea roja para confirmar la distribución normal de los errores.</p>
              </div>
            </div>

          </div>

          <p class="fw-semibold text-muted mb-3" style="font-size: 13px; margin-top: 40px;">Detalle de Predicciones y
            Residuos</p>
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm table-hover small">
              <thead class="bg-light">
                <tr>
                  <th v-for="(name, index) in result.nombres_variables" :key="index">{{ name }} (X)</th>
                  <th>{{ dependentVariable }} (Y Real)</th>
                  <th class="text-end">Y Estimado (Predicción)</th>
                  <th class="text-end">Residuo (Error)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(point, index) in result.datos_entrada" :key="index">
                  <td v-for="(xValue, xIndex) in point.x" :key="xIndex" class="font-monospace">{{ xValue }}</td>
                  <td class="font-monospace fw-bold">{{ point.y }}</td>
                  <td class="text-end font-monospace">{{ result?.predicciones?.[index]?.toFixed(4) ?? 0 }}</td>
                  <td class="text-end font-monospace"
                    :class="{ 'text-danger': (result?.residuos?.[index] ?? 0) > 0.5 || (result?.residuos?.[index] ?? 0) < -0.5, 'text-success': (result?.residuos?.[index] ?? 0) < 0.5 && (result?.residuos?.[index] ?? 0) > -0.5 }">
                    {{ result?.residuos?.[index]?.toFixed(4) ?? 0 }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
