<script setup lang="ts">
import DashboardLayout from '../layouts/DashboardLayout.vue';
import TitlePage from '../widgets/TitlePage.vue';

// Definición de los 6 módulos con rutas reales basadas en router.ts
const modules = [
  {
    id: 1,
    title: 'Información y Guía',
    icon: '💡',
    description: 'Aprende a usar las herramientas de AquaMind. Empieza por aquí.',
    route: '/home', // Dashboard principal / Home View
    color: '#67B7DC' // Azul Claro
  },
  {
    id: 2,
    title: 'Regresion Lineal Simple',
    icon: '💧',
    description: 'Realiza cálculos rápidos y sencillos usando un modelo de regresión lineal simple.',
    route: '/rl-simple',
    color: '#34A853' // Verde Agua - Mapeado a RLSimpleView.vue
  },
  {
    id: 3,
    title: 'Análisis de Sentimientos - YouTube',
    icon: '🧪',
    description: 'Analisa comentarios y datos de yotube en el cual se podra entender la perscepcion del usuario, en base a sus comentarios (sentimientos).',
    route: '/sentimientos', // Mapeado a SentimientosView.vue (Usando la ruta disponible para análisis de datos)
    color: '#EA4335' // Rojo Ladrillo
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
    title: 'Simulación y Modelado Complejo',
    icon: '🌐',
    description: 'Modela y simula el comportamiento de sistemas complejos de redes de distribución (Regresión Múltiple).',
    route: '/rl-multiple',
    color: '#8A60FF' // Morado Suave - Mapeado a RLMultipleView.vue
  },
  {
    id: 6,
    title: 'Reportes y Documentación',
    icon: '📊',
    description: 'Visualiza reportes históricos, descargas de proyectos y acceso a la documentación oficial.',
    route: '/home', // Placeholder, redirige al Home/Dashboard
    color: '#5F6368' // Gris Oscuro
  }
];
</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="AquaMind - Herramientas de Modelado" size="medium" class="flex-shrink-0 mb-0" />
      </div>
      <section class="container-all-mod">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

          <!-- Iteración sobre los módulos definidos -->
          <div class="col" v-for="module in modules" :key="module.id">

            <!-- Bloque/Tarjeta que actúa como <router-link> -->
            <router-link :to="module.route" class="card h-100 module-card shadow-sm border-0 transition-300">

              <!-- Barra superior de color -->
              <div class="card-header border-0 p-0" :style="{ 'border-top': `4px solid ${module.color}` }"></div>

              <div class="card-body d-flex flex-column align-items-start">

                <!-- Icono destacado -->
                <div class="icon-block mb-3 p-3 rounded-3" :style="{ 'background-color': module.color + '1A' }">
                  <span class="fs-3">{{ module.icon }}</span>
                </div>

                <!-- Título -->
                <h5 class="card-title fw-bold mb-2 text-dark">{{ module.title }}</h5>

                <!-- Descripción -->
                <p class="card-text flex-grow-1 text-muted small mb-4">{{ module.description }}</p>

                <!-- Enlace de acción -->
                <div class="btn-link mt-auto fw-bold" :style="{ 'color': module.color }">
                  Explorar Módulo &rarr;
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
/* Estilos para que las tarjetas se vean más profesionales y sean interactivas */

/* Nota: Asumimos que estás utilizando el paquete 'vue-router' */
.module-card {
  display: block;
  /* Hace que el router-link se comporte como block */
  text-decoration: none;
  /* Quita el subrayado del enlace */
  transition: all 0.3s ease-in-out;
  border-radius: 0.5rem;
  /* Bordes redondeados */
  overflow: hidden;
  /* Asegura que el border-top se vea bien */
}

/* Efecto Hover: Elevación y sombra */
.module-card:hover {
  transform: translateY(-5px);
  /* Subir un poco */
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, .175) !important;
  /* Sombra más pronunciada */
}

/* Contenedor del Icono */
.icon-block {
  line-height: 1;
}

/* Título */
.card-title {
  font-size: 1.15rem;
}

/* Enlace/Botón */
.btn-link {
  font-size: 0.95rem;
}
</style>
