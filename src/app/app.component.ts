import { Component, OnInit } from '@angular/core';
import { FuelService } from './services/fuel.service';
import { FilterComponent } from './components/filter/filter.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FilterComponent, MapComponent],
  template: `
    <h1>Geoportal Carburantes</h1>
    <app-filter
      [comunidades]="comunidades"
      [provincias]="provincias"
      (comunidadSelected)="onComunidadSelected($event)"
      (provinciaSelected)="onProvinciaSelected($event)"
      (fuelSelected)="onFuelSelected($event)">
    </app-filter>
    @if (locationLoaded) {
      <app-map [stations]="nearestStations" [currentLocation]="{lat: latitude, lng: longitude}"></app-map>
    } @else {
      <div class="loading">Cargando ubicación...</div>
    }
    <small>Precios actualizados a: {{ fechaActual }}</small>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }
    h1 {
      color: #1976d2;
      margin-bottom: 20px;
    }
    .loading {
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #666;
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
  }

  fetchStations() {
    this.fuelService.getStations().subscribe({
      next: (stations) => {
        this.allStations = stations;
        console.log('Primera estación:', stations[0]); // Para depuración
        
        // Obtener comunidades autónomas
        this.comunidades = this.fuelService.getDistinctValues(stations, "CCAA");
        console.log('Comunidades encontradas:', this.comunidades); // Para depuración
        
        this.fechaActual = stations[0]?.["Fecha"] ?? 'Desconocida';
        this.showNearestStations();
      },
      error: (err) => {
        console.error('Error obteniendo estaciones:', err);
      }
    });
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
      filtered = this.fuelService.filterByComunidad(filtered, this.comunidadSeleccionada);
    }

    if (this.provinciaSeleccionada) {
      filtered = this.fuelService.filterByProvincia(filtered, this.provinciaSeleccionada);
    }

    filtered = this.fuelService.filterByFuelType(filtered, value).map(st => {
      const lat = parseFloat(st.Latitud.replace(',', '.'));
      const lng = parseFloat(st["Longitud (WGS84)"].replace(',', '.'));
      const price = parseFloat(st[value].replace(',', '.'));
      return { ...st, distance: this.calculateDistance(lat, lng), Precio: price };
    });

    this.nearestStations = filtered.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }

  onComunidadSelected(comunidad: string) {
    this.comunidadSeleccionada = comunidad;
    const estacionesFiltradas = this.fuelService.filterByComunidad(this.allStations, comunidad);
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
}
