import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FuelService } from './services/fuel.service';
import { FilterComponent } from './components/filter/filter.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root', standalone: true,
  imports: [CommonModule, FilterComponent, MapComponent], template: `
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
                    [stations]="allStations"
                    [comunidades]="comunidades"
                    [provincias]="provincias"
                    [municipios]="municipios"
                    [municipioSeleccionado]="municipioSeleccionado"
                    [fechaSeleccionada]="fechaSeleccionada"
                    (comunidadSelected)="onComunidadSelected($event)"
                    (provinciaSelected)="onProvinciaSelected($event)"
                    (municipioSelected)="onMunicipioSelected($event)"
                    (fuelSelected)="onFuelSelected($event)"
                    (fechaSelected)="onFechaSelected($event)">
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
                    {{ filteredSize }} estaciones encontradas. Mostrando {{ nearestStations.length }} de las más cercanas.
                  </div>
                  @if (nearestStations.length > 0) {
                    <div class="list-group list-group-flush">
                      @for (station of nearestStations.slice(0, 10); track station.IDEESS) {
                        <div class="list-group-item border-0 px-0">
                          <div class="d-flex w-100 justify-content-between">
                            <a href="#" (click)="onStationClick(station); $event.preventDefault()" class="text-primary text-decoration-underline" style="cursor:pointer;"><h6 class="mb-1 text-primary">{{ station['Rótulo'] }}</h6></a>
                            <small class="text-muted">{{ station.distance | number:'1.1-1' }} km</small>
                          </div>
                          <p class="mb-1 small text-muted">{{ station['Dirección'] }}</p>
                          <small class="text-muted">{{ station.Municipio }}, {{ station.Provincia }}</small>
                          <br>
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
                    [selectedStation]="selectedStation"
                    [fuelSeleccionado]="fuelSeleccionado"
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
  `, styles: [`
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

  // Para almacenar todas las estaciones
  allStations: any[] = [];
  filteredSize: number = 0;
  nearestStations: any[] = [];

  // Para almacenar las comunidades
  comunidades: string[] = [];
  comunidadesMap: { [key: string]: string } = {};

  // Para almacenar las provincias
  provincias: string[] = [];

  // Para almacenar los municipios
  municipios: string[] = [];

  selectedStation: any = null;
  comunidadSeleccionada: string = '';
  provinciaSeleccionada: string = '';
  municipioSeleccionado: string = '';
  fuelSeleccionado: string = '';
  fechaSeleccionada: string = '';

  fechaActual: string = '';
  locationLoaded = false;

  constructor(private fuelService: FuelService) { }

  ngOnInit() {
    this.getUserLocation();
    this.loadComunities();
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationLoaded = true;
          this.loadStationsAndDate();
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Usar Madrid como fallback
          this.latitude = 40.4168;
          this.longitude = -3.7038;
          this.locationLoaded = true;
          this.loadStationsAndDate();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn('Geolocalización no soportada por el navegador');
      // Usar Madrid como fallback
      this.latitude = 40.4168;
      this.longitude = -3.7038;
      this.locationLoaded = true;
      this.loadStationsAndDate();
    }
  }

  private loadStationsAndDate(): void {
    this.fuelService.getStationsAndDate().subscribe({
      next: (response) => {
        this.allStations = response.stations;
        this.fechaActual = response.fecha;

        this.showNearestStations();
      },
      error: (err) => {
        console.error('Error obteniendo estaciones y fecha:', err);
      }
    });
  }

  private loadComunities(): void {
    this.fuelService.getComunidadesAutonomas().subscribe({
      next: (comunidades) => {
        this.comunidadesMap = comunidades;
        this.comunidades = Object.keys(this.comunidadesMap);
      },
      error: (err) => {
        console.error('Error obteniendo comunidades autónomas:', err);
      }
    });
  }

  showNearestStations() {
    if (!this.allStations.length) return;

    this.filteredSize = this.allStations.length;

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

  onStationClick(station: any) {
    this.selectedStation = station;
  }

  onComunidadSelected(comunidad: string) {
    this.comunidadSeleccionada = this.comunidadesMap[comunidad] || comunidad;

    // Filtrar estaciones por la comunidad oficial seleccionada
    const estacionesFiltradas = this.allStations.filter((station: any) =>
      station.IDCCAA === this.comunidadSeleccionada
    );

    // Actualizar las estaciones más cercanas
    // Obtener provincias de las estaciones filtradas
    this.provincias = this.fuelService.getDistinctValues(estacionesFiltradas, "Provincia");
    this.provinciaSeleccionada = ''; // Reiniciar selección anterior
    this.fuelSeleccionado = ''; // Reiniciar selección de combustible

    this.refreshNearestStations();
  }

  onProvinciaSelected(provincia: string) {
    this.provinciaSeleccionada = provincia;
    this.fuelSeleccionado = ''; // Reiniciar selección de combustible

    // Obtener municipios de la provincia seleccionada
    const estacionesProvincia = this.fuelService.filterByProvincia(this.allStations, provincia);
    this.municipios = this.fuelService.getDistinctMunicipios(estacionesProvincia, provincia);
    this.municipioSeleccionado = ''; // Reiniciar selección de municipio

    this.refreshNearestStations();
  }

  onMunicipioSelected(municipio: string) {
    this.municipioSeleccionado = municipio;
    this.refreshNearestStations();
  }

  onFuelSelected(fuel: string) {
    this.fuelSeleccionado = fuel;

    this.refreshNearestStations();
  }

  onFechaSelected(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.cargarEstaciones();
  }

  cargarEstaciones() {
    let fechaParam = this.fechaSeleccionada;
    if (fechaParam) {
      // Convierte yyyy-MM-dd a dd-MM-yyyy
      const [yyyy, mm, dd] = fechaParam.split('-');
      fechaParam = `${dd}-${mm}-${yyyy}`;
    }
    this.fuelService.getStationsAndDate(fechaParam).subscribe(data => {
      this.allStations = data.stations;
      this.fechaActual = data.fecha;
      this.showNearestStations();
    });
  }

  refreshNearestStations() {
    let filtered = [...this.allStations];
    if (this.comunidadSeleccionada) {
      filtered = filtered.filter((station: any) => station.IDCCAA === this.comunidadSeleccionada);
    }

    if (this.provinciaSeleccionada) {
      filtered = this.fuelService.filterByProvincia(filtered, this.provinciaSeleccionada);
    }

    if (this.municipioSeleccionado) {
      filtered = this.fuelService.filterByMunicipio(filtered, this.municipioSeleccionado);
    }

    if (this.fuelSeleccionado) {
      filtered = this.fuelService.filterByFuelType(filtered, this.fuelSeleccionado);
    }

    this.filteredSize = filtered.length;

    filtered = filtered.map((st: any) => {
      const lat = parseFloat(st.Latitud.replace(',', '.'));
      const lng = parseFloat(st["Longitud (WGS84)"].replace(',', '.'));
      return { ...st, distance: this.calculateDistance(lat, lng), parsedLat: lat, parsedLng: lng };
    });

    this.nearestStations = filtered.sort((a: any, b: any) => a.distance - b.distance).slice(0, 10);
  }

  calculateDistance(lat: number, lng: number): number {
    const R = 6371; // km
    const dLat = (lat - this.latitude) * Math.PI / 180;
    const dLng = (lng - this.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
