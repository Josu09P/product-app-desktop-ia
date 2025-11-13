<script setup lang="ts">
import DashboardLayout from '@/presentation/layouts/DashboardLayout.vue';
import TitlePage from '@/presentation/widgets/TitlePage.vue';

const modules = [
  {
    id: 1,
    title: 'Análisis de Sentimientos - YouTube',
    icon: '🧪',
    description: 'Analiza comentarios y datos de YouTube para entender la percepción del usuario en base a sus comentarios (sentimientos).',
    route: '/sentimientos',
    color: '#EA4335' // Rojo Ladrillo
  },
  {
    id: 2,
    title: 'Regresión Lineal Simple',
    icon: '💧',
    description: 'Realiza cálculos rápidos y sencillos usando un modelo de regresión lineal simple.',
    route: '/rl-simple',
    color: '#34A853' // Verde Agua - Mapeado a RLSimpleView.vue
  },
  {
    id: 3,
    title: 'Regresión Lineal Múltiple',
    icon: '🌐',
    description: 'Modela y simula el comportamiento de sistemas complejos de redes de distribución (Regresión Múltiple).',
    route: '/rl-multiple',
    color: '#8A60FF' // Morado Suave - Mapeado a RLMultipleView.vue
  },
  {
    id: 4,
    title: 'Análisis Cluster',
    icon: '📐',
    description: 'Herramientas para la clasificación de datos y diseño hidráulico de canales usando agrupamiento.',
    route: '/clusters',
    color: '#F9AB00' // Naranja Coral - Mapeado a ClustersView.vue
  },
  {
    id: 5,
    title: 'Documentación',
    icon: '📊',
    description: 'Visualiza reportes históricos, descargas de proyectos y acceso a la documentación oficial.',
    route: '/documentation', // Nueva ruta para documentación
    color: '#5F6368' // Gris Oscuro
  },
  {
    id: 6,
    title: 'Información y Guía',
    icon: '💡',
    description: 'Aprende a usar las herramientas de AquaMind. Empieza por aquí.',
    route: 'https://www.scribbr.com/category/statistics/', // Nueva ruta para información y guía
    color: '#67B7DC' // Azul Claro
  }
];

// Función para manejar enlaces externos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleModuleClick(module: any, event: Event) {
  // Si es una ruta interna, el router-link se encarga
  // Si es un enlace externo, lo manejamos aquí
  if (module.route.startsWith('http')) {
    event.preventDefault()
    window.open(module.route, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="Herramientas de Análisis Estadístico" size="medium" class="flex-shrink-0 mb-0" />
      </div>
      <section class="container-all-mod">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div class="col" v-for="module in modules" :key="module.id">
            <router-link
              :to="module.route"
              class="card h-100 module-card shadow-sm border-0 transition-300"
              @click="handleModuleClick(module, $event)"
            >
              <div class="card-header border-0 p-0" :style="{ 'border-top': `4px solid ${module.color}` }"></div>
              <div class="card-body d-flex flex-column align-items-start">
                <div class="icon-block mb-3 p-3 rounded-3" :style="{ 'background-color': module.color + '1A' }">
                  <span class="fs-3">{{ module.icon }}</span>
                </div>
                <h5 class="card-title fw-bold mb-2 text-dark">{{ module.title }}</h5>
                <p class="card-text flex-grow-1 text-muted small mb-4">{{ module.description }}</p>
                <div class="btn-link mt-auto fw-bold" :style="{ 'color': module.color }">
                  Explorar
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.module-card {
  display: block;
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  border-radius: 0.5rem;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, .175) !important;
}

.icon-block {
  line-height: 1;
}

.card-title {
  font-size: 1.15rem;
}

.btn-link {
  font-size: 0.95rem;
}
</style>
