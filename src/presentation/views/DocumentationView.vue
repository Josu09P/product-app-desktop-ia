<script setup lang="ts">
import DashboardLayout from '@/presentation/layouts/DashboardLayout.vue'
import TitlePage from '@/presentation/widgets/TitlePage.vue'

</script>

<template>
  <DashboardLayout>
    <div class="container pt-4 pb-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
        <TitlePage title="Documentación del Proyecto" size="medium" class="flex-shrink-0 mb-0" />
      </div>

      <div class="documentation-content">

        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Descripción del Proyecto</h4>
            </div>
            <div class="card-body">
              <p class="mb-3">
                <strong>AquaMind</strong> es una aplicación de escritorio desarrollada con fines educativos para el curso de <strong>Inteligencia Artificial y Minería de Datos</strong>. Esta plataforma integra múltiples herramientas de análisis de datos y machine learning en una interfaz unificada y fácil de usar.
              </p>

              <h6 class="text-primary mb-3">Objetivos</h6>
              <ul class="mb-0">
                <li>Proporcionar una plataforma educativa para el aprendizaje de técnicas de IA</li>
                <li>Implementar algoritmos fundamentales de minería de datos</li>
                <li>Ofrecer una interfaz intuitiva para análisis de datos</li>
                <li>Facilitar el proceso de aprendizaje mediante ejemplos prácticos</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Integrantes del Proyecto</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-primary mb-3">Equipo de Desarrollo</h6>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <strong>Líder del Proyecto:</strong> Rosalyn Mariela Vela Vargas
                    </li>
                    <li class="mb-2">
                      <strong>Desarrollador Frontend:</strong> Josue Elias Algarate Rubio
                    </li>
                    <li class="mb-2">
                      <strong>Desarrollador Backend:</strong> Sergio Andree Cachique Rodas
                    </li>
                    <li class="mb-2">
                      <strong>Analista de Datos:</strong> Leoncio Sanches Cordova
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6 class="text-primary mb-3">Colaboradores Académicos</h6>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <strong>Asesor Docente:</strong> Ing. Joseph Ibrahim Cruz Rodriguez
                    </li>
                    <li class="mb-2">
                      <strong>Curso:</strong> Inteligencia Artificial y Minería de Datos
                    </li>
                    <li class="mb-2">
                      <strong>Institución:</strong> Universidad Peruana Unión
                    </li>
                    <li class="mb-2">
                      <strong>Periodo Académico:</strong> 8vo Ciclo 2025-II
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Tecnologías Utilizadas</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <h6 class="text-primary mb-3">Frontend</h6>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <strong>Vue.js 3</strong> - Framework principal
                    </li>
                    <li class="mb-2">
                      <strong>TypeScript</strong> - Tipado estático
                    </li>
                    <li class="mb-2">
                      <strong>Bootstrap 5</strong> - Framework CSS
                    </li>
                    <li class="mb-2">
                      <strong>Electron</strong> - Para versión desktop
                    </li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6 class="text-primary mb-3">Backend</h6>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <strong>Python</strong> - Lenguaje principal
                    </li>
                    <li class="mb-2">
                      <strong>Flask</strong> - Framework web
                    </li>
                    <li class="mb-2">
                      <strong>Scikit-learn</strong> - Machine Learning
                    </li>
                    <li class="mb-2">
                      <strong>Pandas & NumPy</strong> - Análisis de datos
                    </li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6 class="text-primary mb-3">Herramientas de Desarrollo</h6>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <strong>Git</strong> - Control de versiones
                    </li>
                    <li class="mb-2">
                      <strong>Vite</strong> - Build tool
                    </li>
                    <li class="mb-2">
                      <strong>ESLint</strong> - Linting
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-5">
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-primary text-white">
      <h4 class="mb-0">Módulos Implementados</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="module-item p-3 border rounded h-100">
            <h6 class="text-primary mb-2">1. Análisis de Sentimientos - YouTube</h6>
            <p class="small mb-0 text-muted">
              Análisis de comentarios de YouTube, clasificación de sentimientos (Positivo/Negativo/Neutral) y visualización de resultados.
            </p>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="module-item p-3 border rounded h-100">
            <h6 class="text-primary mb-2">2. Regresión Lineal Simple</h6>
            <p class="small mb-0 text-muted">
              Modelado de relaciones lineales simples, cálculo de pendiente e intercepto, predicciones y visualizaciones.
            </p>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="module-item p-3 border rounded h-100">
            <h6 class="text-primary mb-2">3. Regresión Lineal Múltiple</h6>
            <p class="small mb-0 text-muted">
              Modelado de relaciones multivariadas, análisis de correlaciones y predicciones complejas.
            </p>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="module-item p-3 border rounded h-100">
            <h6 class="text-primary mb-2">4. Análisis Cluster</h6>
            <p class="small mb-0 text-muted">
              Agrupamiento de datos (K-means), visualización de clusters y análisis de similitudes.
            </p>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="module-item p-3 border rounded h-100">
            <h6 class="text-primary mb-2">5. Reconocimiento Facial</h6>
            <p class="small mb-0 text-muted">
              Sistema de autenticación biométrica con modelo entrenado para usuarios específicos, registro y verificación facial en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Características Principales</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <div class="text-center">
                    <i class="bi bi-shield-lock display-6 text-primary mb-2"></i>
                    <h6 class="text-primary">Autenticación Segura</h6>
                    <p class="small text-muted mb-0">
                      Login facial biométrico, gestión de sesiones y protección de rutas.
                    </p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="text-center">
                    <i class="bi bi-graph-up display-6 text-primary mb-2"></i>
                    <h6 class="text-primary">Visualización de Datos</h6>
                    <p class="small text-muted mb-0">
                      Gráficos interactivos, reportes descargables y dashboard unificado.
                    </p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="text-center">
                    <i class="bi bi-gear display-6 text-primary mb-2"></i>
                    <h6 class="text-primary">Configuración Flexible</h6>
                    <p class="small text-muted mb-0">
                      Interfaz personalizable, gestión de permisos y temas claros/oscuros.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Flujo de Trabajo</h4>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">1</div>
                    <small class="text-muted">Autenticación<br>Login facial</small>
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">2</div>
                    <small class="text-muted">Selección<br>Dashboard</small>
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">3</div>
                    <small class="text-muted">Carga de Datos<br>CSV, manual</small>
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">4</div>
                    <small class="text-muted">Procesamiento<br>Algoritmos ML</small>
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">5</div>
                    <small class="text-muted">Visualización<br>Gráficos</small>
                  </div>
                </div>
                <div class="col-md-2 mb-3">
                  <div class="step-item">
                    <div class="step-number bg-primary text-white rounded-circle mx-auto mb-2">6</div>
                    <small class="text-muted">Exportación<br>Resultados</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Consideraciones Académicas</h4>
            </div>
            <div class="card-body">
              <p class="mb-3">
                Este proyecto fue desarrollado como trabajo final para el curso de <strong>Inteligencia Artificial y Minería de Datos</strong>. Su propósito principal es educativo y demostrativo de los conceptos aprendidos durante el curso.
              </p>

              <h6 class="text-primary mb-3">Aprendizajes Implementados</h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="small">
                    <li>Algoritmos de machine learning supervisado y no supervisado</li>
                    <li>Procesamiento de lenguaje natural (NLP)</li>
                    <li>Análisis exploratorio de datos (EDA)</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="small">
                    <li>Desarrollo full-stack de aplicaciones</li>
                    <li>Integración de sistemas</li>
                    <li>Gestión de proyectos de software</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.documentation-content {
  max-width: 1200px;
  margin: 0 auto;
}

.bg-primary {
  background-color: #acacac33 !important;
  color: black !important;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.module-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e9ecef !important;
}

.module-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.step-item .step-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.upload-area {
  border: 2px dashed #dee2e6;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #0d6efd;
}

/* Se eliminaron los estilos de .bg-purple y .text-purple */

/* Estilos para mantener consistencia con el diseño */
.card {
  border-radius: 0.5rem;
}

.card-body {
  padding: 1.5rem;
}

h4 {
  font-size: 1.25rem;
  font-weight: 600;
}

h6 {
  font-size: 1rem;
  font-weight: 600;
}

.small {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .step-item {
    margin-bottom: 1.5rem;
  }

  .module-item {
    margin-bottom: 1rem;
  }
}
</style>
