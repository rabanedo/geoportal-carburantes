import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FuelService } from './services/fuel.service';
import { FilterComponent } from './components/filter/filter.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',  standalone: true,
  imports: [CommonModule, FilterComponent, MapComponent],template: `
    <div class="min-vh-100 bg-light">
      <!-- Header -->
      <header class="bg-primary text-white shadow-sm">
        <div class="container py-4">
          <div class="row align-items-center">
            <div class="col">
              <h1 class="display-5 mb-2 fw-bold">
                <i class="fas fa-gas-pump me-3 text-warning"></i>
                Geoportal Carburantes
              </h1>
              <p class="lead mb-0 opacity-75">Encuentra las gasolineras más cercanas con los mejores precios</p>
            </div>
          </div>
        </div>
      </header>      <!-- Main Content -->
      <div class="container-fluid py-4 d-flex flex-column" style="height: calc(100vh - 140px);">
        <div class="row g-4 flex-grow-1">
          <!-- Sidebar con filtros -->
          <div class="col-lg-3 col-md-4">
            <div class="sticky-top" style="top: 20px;">
              <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-white border-bottom">
                  <h5 class="card-title mb-0 text-primary fw-semibold">
                    <i class="fas fa-filter me-2"></i>
                    Filtros de Búsqueda
                  </h5>
                </div>
                <div class="card-body">
                  <app-filter
                    [comunidades]="comunidades"
                    [provincias]="provincias"
                    (comunidadSelected)="onComunidadSelected($event)"
                    (provinciaSelected)="onProvinciaSelected($event)"
                    (fuelSelected)="onFuelSelected($event)">
                  </app-filter>
                </div>
              </div>
                <!-- Lista de estaciones -->
              <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom">
                  <h5 class="card-title mb-0 text-primary fw-semibold">
                    <i class="fas fa-list me-2"></i>
                    Resultados
                  </h5>
                </div>
                <div class="card-body">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    {{ nearestStations.length }} estaciones encontradas
                  </div>
                  @if (nearestStations.length > 0) {
                    <div class="list-group list-group-flush">
                      @for (station of nearestStations.slice(0, 5); track station.IDEESS) {
                        <div class="list-group-item border-0 px-0">
                          <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1 text-primary">{{ station['Rótulo'] }}</h6>
                            <small class="text-muted">{{ station.distance | number:'1.1-1' }} km</small>
                          </div>
                          <p class="mb-1 small text-muted">{{ station['Dirección'] }}</p>
                          <small class="text-muted">{{ station.Municipio }}, {{ station.Provincia }}</small>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-muted text-center">No se encontraron estaciones</p>
                  }
                </div>
              </div>
            </div>
          </div>          <!-- Mapa principal -->
          <div class="col-lg-9 col-md-8 d-flex flex-column">
            <div class="card shadow-sm border-0 d-flex flex-column h-100">
              <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-shrink-0">
                <h5 class="card-title mb-0 text-primary fw-semibold">
                  <i class="fas fa-map-marked-alt me-2"></i>
                  Mapa de Gasolineras
                </h5>
                <div class="badge bg-info text-dark">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  {{ nearestStations.length }} estaciones
                </div>
              </div>

              <div class="card-body p-0 position-relative flex-grow-1 d-flex flex-column">
                @if (locationLoaded) {
                  <app-map 
                    [stations]="nearestStations" 
                    [currentLocation]="{lat: latitude, lng: longitude}"
                    class="flex-grow-1 d-flex">
                  </app-map>
                } @else {
                  <div class="d-flex justify-content-center align-items-center flex-grow-1">
                    <div class="text-center">
                      <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Cargando...</span>
                      </div>
                      <h5 class="text-primary mb-2">Obteniendo ubicación...</h5>
                      <p class="text-muted">Localizando tu posición actual para mostrar las gasolineras más cercanas</p>
                      <div class="mt-3">
                        <i class="fas fa-location-arrow text-primary me-2"></i>
                        <small class="text-muted">Asegúrate de permitir el acceso a la ubicación</small>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Footer con información -->
        <footer class="mt-5 py-4 bg-white rounded shadow-sm">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="d-flex align-items-center">
                  <i class="fas fa-clock text-success me-2"></i>
                  <small class="text-muted">
                    Precios actualizados a: <strong class="text-dark">{{ fechaActual }}</strong>
                  </small>
                </div>
              </div>
              <div class="col-md-6 text-md-end mt-2 mt-md-0">
                <div class="d-flex align-items-center justify-content-md-end">
                  <i class="fas fa-info-circle text-primary me-2"></i>
                  <small class="text-muted">
                    Datos proporcionados por el Ministerio de Industria, Comercio y Turismo
                  </small>
                </div>
              </div>
            </div>
            <hr class="my-3">
            <div class="row">
              <div class="col text-center">
                <small class="text-muted">
                  <i class="fas fa-heart text-danger me-1"></i>
                  Desarrollado para facilitar la búsqueda de combustible
                </small>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,  styles: [`
    :host {
      display: block;
    }
    
    .card {
      transition: all 0.3s ease;
      border: none !important;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
    }
    
    .card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6 !important;
    }    app-map {
      height: 100%;
      width: 100%;
      min-height: calc(100vh - 300px);
      border-radius: 0 0 0.375rem 0.375rem;
      overflow: hidden;
      flex: 1;
      display: flex;
    }
    
    .card.flex-grow-1,
    .card.h-100 {
      min-height: calc(100vh - 300px);
      display: flex;
      flex-direction: column;
    }
    
    .card-body.flex-grow-1 {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
    
    header {
      background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
    }
    
    .sticky-top {
      position: sticky;
      top: 20px;
      z-index: 1020;
    }
    
    footer {
      border: 1px solid #e9ecef;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
    
    .text-warning {
      color: #ffc107 !important;
    }
    
    @media (max-width: 768px) {
      .sticky-top {
        position: relative;
        top: auto;
      }
      
      .display-5 {
        font-size: 1.75rem;
      }
      
      .lead {
        font-size: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  latitude = 0;
  longitude = 0;
  allStations: any[] = [];
  nearestStations: any[] = [];
  comunidades: string[] = [];
  provincias: string[] = [];
  comunidadSeleccionada: string = '';
  provinciaSeleccionada: string = '';
  fechaActual: string = '';
  locationLoaded = false;

  constructor(private fuelService: FuelService) {}

  ngOnInit() {
    this.getUserLocation();
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationLoaded = true;
          this.fetchStations();
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Usar Madrid como fallback
          this.latitude = 40.4168;
          this.longitude = -3.7038;
          this.locationLoaded = true;
          this.fetchStations();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn('Geolocalización no soportada por el navegador');
      // Usar Madrid como fallback
      this.latitude = 40.4168;
      this.longitude = -3.7038;
      this.locationLoaded = true;
      this.fetchStations();
    }
  }  fetchStations() {
    console.log('Iniciando obtención de estaciones...');
    
    // Obtener estaciones y comunidades oficiales
    this.fuelService.getStationsWithComunidades().subscribe({
      next: (response) => {
        console.log('Estaciones obtenidas exitosamente');
        this.allStations = response.stations;
        console.log('Respuesta de la API:', response.rawData); // Para diagnóstico
        
        // Obtener comunidades autónomas usando los nombres oficiales
        const comunidadesUnicas = new Set<string>();
        response.stations.forEach((station: any) => {
          if (station.CCAAOficial) {
            comunidadesUnicas.add(station.CCAAOficial);
          }
        });
        
        this.comunidades = Array.from(comunidadesUnicas).sort((a, b) => a.localeCompare(b));
        console.log('Comunidades oficiales encontradas:', this.comunidades);
        
        // Buscar fecha en la respuesta
        this.fechaActual = this.buscarFecha(response);
        this.showNearestStations();
      },
      error: (err) => {
        console.error('Error obteniendo estaciones:', err);
        console.log('Intentando con método de respaldo...');
        
        // Fallback: usar el método anterior
        this.fuelService.getStationsWithDate().subscribe({
          next: (response) => {
            console.log('Datos obtenidos con método de respaldo');
            this.allStations = response.stations;
            this.comunidades = this.fuelService.getDistinctValues(response.stations, "CCAA");
            this.fechaActual = this.buscarFecha(response);
            this.showNearestStations();
          },
          error: (fallbackErr) => {
            console.error('Error en método de respaldo:', fallbackErr);
            // Usar datos mínimos para evitar bloqueo
            this.allStations = [];
            this.comunidades = [];
            this.fechaActual = new Date().toLocaleDateString('es-ES') + ' (sin datos)';
          }
        });
      }
    });
  }
  private buscarFecha(response: any): string {
    let fechaEncontrada: string | null = null;
    
    // 1. Buscar en la respuesta principal
    if (response.fecha) {
      fechaEncontrada = response.fecha;
      console.log('Fecha encontrada en response.fecha:', fechaEncontrada);
    }
    
    // 2. Buscar en campos comunes de la respuesta raíz
    if (!fechaEncontrada && response.rawData) {
      const rawData = response.rawData;
      const camposRespuesta = [
        'Fecha', 
        'FechaActualizacion', 
        'Fecha_Actualizacion',
        'Timestamp', 
        'LastUpdate', 
        'Nota',
        'NotaInformativa',
        'UltimaActualizacion'
      ];
      
      for (const campo of camposRespuesta) {
        if (rawData[campo] && typeof rawData[campo] === 'string' && rawData[campo].trim() !== '') {
          fechaEncontrada = rawData[campo];
          console.log(`Fecha encontrada en respuesta.${campo}:`, fechaEncontrada);
          break;
        }
      }
    }
    
    // 3. Buscar en la primera estación si está disponible
    if (!fechaEncontrada && response.stations && response.stations.length > 0) {
      const estacion = response.stations[0];
      const camposEstacion = ['Fecha', 'FechaActualizacion', 'Timestamp', 'LastModified'];
      
      for (const campo of camposEstacion) {
        if (estacion[campo] && typeof estacion[campo] === 'string' && estacion[campo].trim() !== '') {
          fechaEncontrada = estacion[campo];
          console.log(`Fecha encontrada en estacion.${campo}:`, fechaEncontrada);
          break;
        }
      }
    }
    
    // 4. Si encontramos una fecha, formatearla
    if (fechaEncontrada) {
      const fechaFormateada = this.formatearFecha(fechaEncontrada);
      if (fechaFormateada !== fechaEncontrada) {
        return fechaFormateada;
      }
    }
    
    // 5. Como último recurso, usar la fecha actual
    const fechaActual = new Date();
    return fechaActual.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' (consulta realizada)';
  }

  showNearestStations() {
    if (!this.allStations.length) return;
    
    this.nearestStations = this.allStations
      .filter(st => st.Latitud && st["Longitud (WGS84)"])
      .map(st => {
        const lat = parseFloat(st.Latitud.replace(',', '.'));
        const lng = parseFloat(st["Longitud (WGS84)"].replace(',', '.'));
        return { 
          ...st, 
          distance: this.calculateDistance(lat, lng),
          parsedLat: lat,
          parsedLng: lng
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }
  onFuelSelected(value: string) {
    let filtered = [...this.allStations];

    if (this.comunidadSeleccionada) {
      filtered = filtered.filter((station: any) => station.CCAAOficial === this.comunidadSeleccionada);
    }

    if (this.provinciaSeleccionada) {
      filtered = this.fuelService.filterByProvincia(filtered, this.provinciaSeleccionada);
    }

    filtered = this.fuelService.filterByFuelType(filtered, value).map((st: any) => {
      const lat = parseFloat(st.Latitud.replace(',', '.'));
      const lng = parseFloat(st["Longitud (WGS84)"].replace(',', '.'));
      const price = parseFloat(st[value].replace(',', '.'));
      return { ...st, distance: this.calculateDistance(lat, lng), Precio: price };
    });

    this.nearestStations = filtered.sort((a: any, b: any) => a.distance - b.distance).slice(0, 3);
  }
  onComunidadSelected(comunidad: string) {
    this.comunidadSeleccionada = comunidad;
    
    // Filtrar estaciones por la comunidad oficial seleccionada
    const estacionesFiltradas = this.allStations.filter((station: any) => 
      station.CCAAOficial === comunidad
    );
    
    // Obtener provincias de las estaciones filtradas
    this.provincias = this.fuelService.getDistinctValues(estacionesFiltradas, "Provincia");
    this.provinciaSeleccionada = ''; // Reiniciar selección anterior
  }

  onProvinciaSelected(provincia: string) {
    this.provinciaSeleccionada = provincia;
  }

  calculateDistance(lat: number, lng: number): number {
    const R = 6371; // km
    const dLat = (lat - this.latitude) * Math.PI / 180;
    const dLng = (lng - this.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  private formatearFecha(fecha: string): string {
    if (!fecha || fecha.trim() === '') {
      return fecha;
    }
    
    try {
      let fechaObj: Date | null = null;
      const fechaLimpia = fecha.trim();
      
      // Formato 1: ISO 8601 (con T)
      if (fechaLimpia.includes('T')) {
        fechaObj = new Date(fechaLimpia);
      }
      // Formato 2: DD/MM/YYYY o DD/MM/YYYY HH:MM
      else if (fechaLimpia.includes('/')) {
        const partes = fechaLimpia.split(' ');
        const fechaParte = partes[0];
        const horaParte = partes[1] || '00:00';
        
        const fechaNumeros = fechaParte.split('/');
        if (fechaNumeros.length === 3) {
          const dia = parseInt(fechaNumeros[0]);
          const mes = parseInt(fechaNumeros[1]) - 1; // Los meses en JS van de 0-11
          const año = parseInt(fechaNumeros[2]);
          
          if (horaParte) {
            const horaNumeros = horaParte.split(':');
            const horas = parseInt(horaNumeros[0]) || 0;
            const minutos = parseInt(horaNumeros[1]) || 0;
            fechaObj = new Date(año, mes, dia, horas, minutos);
          } else {
            fechaObj = new Date(año, mes, dia);
          }
        }
      }
      // Formato 3: DD-MM-YYYY
      else if (fechaLimpia.includes('-')) {
        const partes = fechaLimpia.split(' ');
        const fechaParte = partes[0];
        
        const fechaNumeros = fechaParte.split('-');
        if (fechaNumeros.length === 3 && fechaNumeros[0].length <= 2) {
          const dia = parseInt(fechaNumeros[0]);
          const mes = parseInt(fechaNumeros[1]) - 1;
          const año = parseInt(fechaNumeros[2]);
          fechaObj = new Date(año, mes, dia);
        } else {
          // Posiblemente formato YYYY-MM-DD
          fechaObj = new Date(fechaLimpia);
        }
      }
      // Formato 4: Otros formatos estándar
      else {
        fechaObj = new Date(fechaLimpia);
      }

      // Verificar si la fecha es válida
      if (!fechaObj || isNaN(fechaObj.getTime())) {
        console.warn('No se pudo parsear la fecha:', fecha);
        return fecha; // Devolver la fecha original si no se puede parsear
      }

      // Formatear en español
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', fecha);
      return fecha; // Devolver la fecha original en caso de error
    }
  }
}
