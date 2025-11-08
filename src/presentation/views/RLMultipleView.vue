<script setup lang="ts">
import { ref, computed } from "vue"
import DashboardLayout from "@/presentation/layouts/DashboardLayout.vue"
import TitlePage from "../widgets/TitlePage.vue"
import PostRLMultipleUseCase from "@/domain/usecase/RLMultipleUseCase/PostRLMultipleUseCase"
import type { RLMultipleResult, DataPoint } from "@/domain/models/RLMultipleModel"
import { showToast } from '@/utils/toast'
import ResidualsScatterPlot from "@/presentation/widgets/sections/ResidualsScatterPlot.vue"
import ResidualsHistogram from "../widgets/sections/ResidualsHistogram.vue"
import ResidualsQQPlot from "../widgets/sections/ResidualsQQPlot.vue"
import ScatterRegressionPlot from "../widgets/sections/ScatterRegressionPlot.vue"

// --- ESTADO GLOBAL DE DATOS ---
const loading = ref(false)
const result = ref<RLMultipleResult | null>(null)

/** Nombres de todas las columnas disponibles en el CSV (incluyendo encabezados). */
const availableColumns = ref<string[]>([])
/** El dataset completo cargado desde el CSV, como array de arrays (filas). */
const rawDataset = ref<number[][]>([])

// --- ESTADO DE SELECCIÓN DE VARIABLES (Estilo JASP/Jamovi) ---
/** Nombre de la columna seleccionada como Variable Dependiente (Y). */
const dependentVariable = ref<string | null>(null)
/** Nombres de las columnas seleccionadas como Variables Independientes (X's). */
const independentVariables = ref<string[]>([])


// -----------------------------------------------------------
// --- LÓGICA DE CARGA Y PARSEO DE CSV (REFRACTORIZADO) ---
// -----------------------------------------------------------

/**
 * Función robusta para parsear CSV, detectando separadores y parseando números.
 * @param csvText El contenido del archivo CSV como string.
 */
function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '')

  // La comprobación resuelve los errores de lines[0] y lines[1]
  if (lines.length < 2) {
    showToast('El archivo CSV debe tener encabezados y al menos una fila de datos.', 'error');
    // Asegurarse de que el input esté limpio si hay un error
    availableColumns.value = [];
    rawDataset.value = [];
    return;
  }

  // 1. Detección de Separador de Columna: Preferimos coma, luego punto y coma.
  // Usamos el operador de aserción no nula '!' aquí, ya que lines.length >= 2
  // garantiza que lines[1] y lines[0] existen.
  const firstDataLine = lines[1]!;
  const headerLine = lines[0]!;

  let delimiter = ',';
  if (firstDataLine.split(';').length > firstDataLine.split(',').length) {
    delimiter = ';'; // Usar punto y coma si hay más separaciones con él
  }

  // Función para limpiar y convertir un valor a número (VERSION MÁS ROBUSTA)
  const cleanAndParse = (value: string): number | null => {
    let cleaned = value.trim();

    if (cleaned === '') return null; // Ignorar celdas vacías

    // 1. Eliminar cualquier carácter que no sea dígito, punto o coma.
    // Esto elimina signos de moneda, paréntesis, etc.
    cleaned = cleaned.replace(/[^0-9.,-]/g, '');

    // 2. Manejar separadores decimales: Convertir la coma (si existe) a punto.
    // Si hay una coma Y un punto, asumimos que el punto es de mil y la coma es decimal (formato europeo).
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Eliminar el punto (separador de mil), y luego reemplazar la coma por punto (separador decimal)
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
    } else if (cleaned.includes(',')) {
      // Si solo hay coma, asumir que es decimal (formato latino)
      cleaned = cleaned.replace(/,/g, '.');
    }

    // 3. Intentar parsear a flotante
    const num = parseFloat(cleaned);

    if (!isNaN(num)) {
      return num;
    }

    // Si la limpieza no funciona (ej. es texto puro), devolver nulo.
    return null;
  };

  // 2. Extraer Encabezados (primera línea)
  const headers = headerLine.split(delimiter).map(h => h.trim());
  availableColumns.value = headers;

  // 3. Procesar Datos (resto de las líneas) - **MODIFICACIÓN AQUÍ**
  const data: number[][] = [];
  let validRows = 0;

  // Identificar las columnas que NO son numéricas y que deben ignorarse en el parseo.
  // Basado en tu CSV: Fecha, Sucursal, Cuenta, Tipo_Documento, Cliente, Serie_Documento, N_SerieDocumento, Producto, Estado_Venta
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

    // Convertir CADA PARTE a número. Si es una columna Categórica, la parseamos, pero NO la validamos.
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      let num: number | null = null;

      // SOLO aplicamos cleanAndParse a las columnas que sabemos que deberían ser numéricas.
      if (numericIndices.includes(j)) {
        num = cleanAndParse(part ?? '');

        // Si la columna es numérica (Compro, Debe, Tipcam) y falla el parseo, descartamos la fila.
        if (num === null) {
          rowIsValid = false;
          break;
        }
      }
      // Si la columna NO es de las numéricas, le asignamos un 0.
      // ¡IMPORTANTE! Las columnas categóricas que contienen texto deben ser un número para ser guardadas en rawDataset.
      // Las guardaremos como 0 para mantener la estructura, aunque es una simplificación extrema.
      // Una mejor práctica es almacenar el rawDataset como (string | number)[][]

      // Alternativa: Si no es una columna numérica, asumimos 0, pero solo si es estrictamente un valor que no necesitamos.
      // Dado que el 'rawDataset' es 'number[][]', debemos guardar un número en cada posición.
      if (num === null) {
        num = 0; // Usamos 0 si es categórico o si era numérico pero lo descartamos por arriba (no deberia pasar con el 'break')
      }
      numericParts.push(num);
    }

    // Si la fila es válida (todas las columnas numéricas que nos interesan pasaron)
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
    availableColumns.value = []; // Resetear si no hay datos válidos
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
    target.value = ''; // Limpiar input file
    return;
  }

  // Resetear estados
  dependentVariable.value = null;
  independentVariables.value = [];
  rawDataset.value = [];
  availableColumns.value = []; // Importante resetear las columnas

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
// --- LÓGICA DE PROCESAMIENTO BASADA EN SELECCIÓN ---
// -----------------------------------------------------------

/**
 * Combina la selección de variables y el rawDataset para generar el DataPoint[]
 * que la API necesita.
 */
const processedDataPoints = computed<DataPoint[]>(() => {
  // La condición clave para la activación
  if (!dependentVariable.value || independentVariables.value.length === 0 || rawDataset.value.length === 0) {
    return [];
  }

  // Obtener los índices de las columnas seleccionadas
  const allColumns = availableColumns.value;
  const yIndex = allColumns.findIndex(col => col === dependentVariable.value);
  const xIndices = independentVariables.value.map(xName => allColumns.findIndex(col => col === xName));

  if (yIndex === -1 || xIndices.some(idx => idx === -1)) {
    console.error("Índices de columna no encontrados. ¿Variables eliminadas?");
    return [];
  }

  const dataPoints: DataPoint[] = [];

  // Mapear cada fila del dataset a la estructura DataPoint
  rawDataset.value.forEach(row => {
    const yValue = row[yIndex];
    const xValues = xIndices.map(idx => row[idx]);

    // Verificación final (redundante pero segura)
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
// --- LÓGICA DE CONSUMO (Igual que antes, pero usa el nuevo computed) ---
// -----------------------------------------------------------

async function analizar() {
  const dataPoints = processedDataPoints.value

  if (dataPoints.length < 3) {
    showToast('Se requieren al menos 3 puntos de datos y variables seleccionadas para el análisis.', 'error');
    return
  }

  if (independentVariables.value.length === 0) {
    showToast('Debes seleccionar al menos una Variable Independiente (X).', 'error');
    return
  }

  loading.value = true
  result.value = null

  // Usamos los nombres de las variables X seleccionadas
  const data = await PostRLMultipleUseCase.ejecutar(dataPoints, independentVariables.value)
  if (data) result.value = data

  loading.value = false
}

// Lógica para mover variables entre las listas (similar a JASP/Jamovi)

function moveToDependent(variable: string) {
  dependentVariable.value = variable;
  // Si la variable estaba en las independientes, la quitamos
  independentVariables.value = independentVariables.value.filter(v => v !== variable);
}

function addToIndependent(variable: string) {
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
        <TitlePage title="Regresión Lineal Múltiple" size="medium" class="flex-shrink-0 mb-0" />

        <!-- BOTÓN DE ANÁLISIS -->
        <button class="btn btn-primary px-4 fw-bold shadow-sm" @click="analizar"
          :disabled="loading || processedDataPoints.length < 3">
          {{ loading ? 'Calculando...' : 'Ejecutar' }}
        </button>
      </div>

      <!-- SECCIÓN DE CONFIGURACIÓN Y DATOS DE ENTRADA -->
      <div class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold text-dark mb-4">Carga y Configuración de Variables</h4>

        <!-- Carga de Archivo CSV -->
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

        <!-- Panel de Selección de Variables (Estilo JASP/Jamovi) -->
        <div v-if="availableColumns.length > 0" class="row g-4 align-items-stretch">
          <p class="text-muted mt-3 fw-bold mb-1" style="font-size: 13px;">Paso 2: Seleccionar Variables</p>

          <!-- Lista de Variables Disponibles -->
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
                      style="border-radius: 1.5rem;" title="Mover a Independientes">X</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Columna de Variables Seleccionadas -->
          <div class="col-12 col-lg-8">
            <div class="d-flex flex-column h-100">

              <!-- Variable Dependiente (Y) -->
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

              <!-- Variables Independientes (X) -->
              <div class="card flex-grow-1 p-3 border-1">
                <h6 class="fw-bold text-success mb-2">Variables Independientes - X - {{ independentVariables.length }}
                </h6>
                <ul v-if="independentVariables.length > 0" class="list-group list-group-flush">
                  <li v-for="col in independentVariables" :key="col"
                    class="list-group-item d-flex justify-content-between align-items-center p-2">
                    <span class="text-truncate">{{ col }}</span>
                    <button @click="removeFromIndependent(col)" class="btn btn-sm btn-outline-danger" title="Quitar"
                      style="border-radius: 1.5rem;"><i class="bi bi-trash"></i></button>
                  </li>
                </ul>
                <p v-else class="text-muted small mb-0">Selecciona las variables</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Muestra el número de datos procesados -->
        <p v-if="availableColumns.length > 0" class="mt-4 small text-end text-muted">
          <strong>{{ processedDataPoints.length }}</strong> puntos de datos listos para el análisis.
        </p>

      </div>

      <!-- ESTADO DE CARGA Y RESULTADOS (Se mantienen) -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Calculando el modelo de regresión...</p>
      </div>

      <div v-if="result" class="card border-1 rounded-4 p-lg-5 p-4 mt-4 card-custom-shadow">
        <h4 class="fw-bold mb-4">Resultados del Análisis</h4>

        <!-- RESUMEN CLAVE -->
        <div class="row mb-5 g-4">

          <!-- Ecuación -->
          <div class="col-12 col-lg-8">
            <div class="card bg-light border-1 p-4 h-100">
              <p class="card-title text-muted fw-bold" style="font-size: 13px;">Ecuación de Regresión Estimada</p>
              <p class="card-text fs-5 font-monospace text-dark">{{ result.ecuacion }}</p>
              <p class="small text-muted mt-2">
                La ecuación permite predecir la variable Y <strong>{{ dependentVariable }}</strong>
                en función de las variables X ingresadas.
              </p>
            </div>
          </div>

          <!-- R-Cuadrado -->
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

        <!-- TABLA DE COEFICIENTES -->
        <p class="fw-semibold text-muted mb-3" style="font-size: 13px;">Tabla de Coeficientes</p>
        <div class="table-responsive mb-5">
          <!-- ... (Resto de la tabla de coeficientes se mantiene, pero usa result.nombres_variables) ... -->
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

            <div class="col-12">
              <div class="card p-3 border-1">
                <h6 class="fw-bold mb-3">Gráfico de Dispersión: Y vs. {{ result.nombres_variables[0] }}</h6>
                <div style="height: 400px auto;">
                  <ScatterRegressionPlot v-if="result && result.nombres_variables.length > 0"
                    :dataPoints="result.datos_entrada" :xLabel="result.nombres_variables[0] ?? ''"
                    :yLabel="dependentVariable!" :intercept="result.coeficientes[0] ?? 0"
                    :coefficient="result.coeficientes[1] ?? 0" />
                  <p class="text-muted small mt-2">Muestra la relación marginal entre la variable dependiente (Y) y la
                    <strong>primera</strong> predictora ($X_1$), incluyendo la línea de regresión múltiple proyectada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLA DE DETALLE DE DATOS -->
          <p class="fw-semibold text-muted mb-3" style="font-size: 13px; margin-top: 40px;">Detalle de Predicciones y
            Residuos</p>
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm table-hover small">
              <thead class="bg-light">
                <tr>
                  <th v-for="(name, index) in result.nombres_variables" :key="index">{{ name }}</th>
                  <th>{{ dependentVariable }} (Y Real)</th>
                  <th class="text-end">Y Estimado (Predicción)</th>
                  <th class="text-end">Residuo (Error)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(point, index) in result.datos_entrada" :key="index">
                  <td v-for="(xValue, xIndex) in point.x" :key="xIndex" class="font-monospace">{{ xValue }}</td>
                  <td class="font-monospace fw-bold">{{ point.y }}</td>
                  <td class="text-end font-monospace">{{ result?.predicciones?.[index] ?? 0 }}</td>
                  <td class="text-end font-monospace"
                    :class="{ 'text-danger': (result?.residuos?.[index] ?? 0) > 0.5 || (result?.residuos?.[index] ?? 0) < -0.5, 'text-success': (result?.residuos?.[index] ?? 0) < 0.5 && (result?.residuos?.[index] ?? 0) > -0.5 }">
                    {{ result?.residuos?.[index] ?? 0 }}
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

<script lang="ts">
export default {
  // No hay componentes externos adicionales en este caso
}
</script>
