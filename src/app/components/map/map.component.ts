import * as L from 'leaflet';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { icon, Marker, LatLng } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container position-relative">
      <div id="map" class="rounded shadow-sm"></div>
      <div class="map-overlay position-absolute top-0 end-0 m-3">
        <div class="btn-group-vertical shadow-sm" role="group">
          <button type="button" class="btn btn-light btn-sm border" (click)="zoomIn()" title="Acercar">
            <i class="fas fa-plus"></i>
          </button>
          <button type="button" class="btn btn-light btn-sm border" (click)="zoomOut()" title="Alejar">
            <i class="fas fa-minus"></i>
          </button>
          <button type="button" class="btn btn-light btn-sm border" (click)="centerOnUser()" title="Mi ubicación">
            <i class="fas fa-crosshairs"></i>
          </button>
        </div>
      </div>
      <div class="map-info position-absolute bottom-0 start-0 m-3">
        <div class="badge bg-dark bg-opacity-75 text-white p-2">
          <i class="fas fa-map-marker-alt me-1"></i>
          {{ stations.length }} estaciones encontradas
        </div>
      </div>
    </div>
  `,  styles: [`
    .map-container {
      height: 100%;
      width: 100%;
      min-height: 400px;
      overflow: hidden;
      border-radius: 0.375rem;
      display: flex;
      flex-direction: column;
    }
    
    #map {
      height: 100%;
      width: 100%;
      min-height: 400px;
      border-radius: 0.375rem;
      flex-grow: 1;
    }
    
    .map-overlay {
      z-index: 1000;
    }
    
    .btn-group-vertical .btn {
      border-radius: 0;
      width: 40px;
      height: 40px;
    }
    
    .btn-group-vertical .btn:first-child {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }
    
    .btn-group-vertical .btn:last-child {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
    
    .map-info {
      z-index: 1000;
    }
    
    .badge {
      border-radius: 0.5rem;
      font-size: 0.8rem;
    }
    
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
    
    /* Custom marker styles */
    .custom-marker {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      transition: all 0.2s ease;
    }
    
    .custom-marker:hover {
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
      transform: scale(1.1);
    }
    
    .gas-station-marker {
      animation: pulse 2s infinite;
    }
    
    .user-location-marker {
      animation: bounce 1s ease-in-out infinite alternate;
    }
    
    @keyframes pulse {
      0% { filter: drop-shadow(0 2px 4px rgba(255,107,107,0.3)); }
      50% { filter: drop-shadow(0 2px 8px rgba(255,107,107,0.6)); }
      100% { filter: drop-shadow(0 2px 4px rgba(255,107,107,0.3)); }
    }
    
    @keyframes bounce {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-3px); }
    }
    
    @media (max-width: 768px) {
      .map-container {
        min-height: 300px;
      }
      
      #map {
        min-height: 300px;
      }
      
      .btn-group-vertical .btn {
        width: 36px;
        height: 36px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class MapComponent implements OnChanges {
  @Input() stations: any[] = [];
  @Input() currentLocation: { lat: number, lng: number } = { lat: 0, lng: 0 };

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private stationMarkers: L.Marker[] = [];
  private readonly defaultZoom = 13;  // Modern custom icons
  private readonly gasStationIcon = icon({
    iconUrl: 'assets/leaflet/images/gas-station-marker.svg',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    tooltipAnchor: [16, -30],
    className: 'custom-marker gas-station-marker'
  });

  private readonly userLocationIcon = icon({
    iconUrl: 'assets/leaflet/images/user-location-marker.svg',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    tooltipAnchor: [16, -30],
    className: 'custom-marker user-location-marker'
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentLocation'] && this.currentLocation.lat !== 0 && this.currentLocation.lng !== 0) {
      this.initMap();
    }

    if (changes['stations'] && this.map) {
      this.updateMarkers();
    }
  }

  private initMap(): void {
    if (!this.map) {
      this.map = L.map('map').setView(
        [this.currentLocation.lat, this.currentLocation.lng], 
        this.defaultZoom
      );
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);      // Configurar icono por defecto para todos los marcadores
      Marker.prototype.options.icon = this.gasStationIcon;

      // Añadir marcador de usuario
      this.addUserMarker();
      
      // Añadir marcadores de estaciones si existen
      if (this.stations.length) {
        this.updateMarkers();
      }
    } else {
      // Si el mapa ya existe, solo centrarlo en la nueva ubicación
      this.map.setView([this.currentLocation.lat, this.currentLocation.lng], this.defaultZoom);
      this.addUserMarker();
    }
  }

  private addUserMarker(): void {
    // Eliminar marcador anterior si existe
    if (this.userMarker) {
      this.userMarker.remove();
    }    // Añadir nuevo marcador
    this.userMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
      icon: this.userLocationIcon,
      zIndexOffset: 1000 // Para asegurar que esté encima de otros marcadores
    }).addTo(this.map!)
      .bindPopup('Tu ubicación actual')
      .openPopup();
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Limpiar marcadores existentes
    this.clearStationMarkers();    // Añadir nuevos marcadores
    this.stationMarkers = this.stations
      .filter(station => station.parsedLat && station.parsedLng)
      .map(station => {
        const marker = L.marker([station.parsedLat, station.parsedLng], {
          icon: this.gasStationIcon
        })
          .addTo(this.map!)
          .bindPopup(this.createPopupContent(station));
        
        return marker;
      });
  }

  private clearStationMarkers(): void {
    this.stationMarkers.forEach(marker => {
      this.map?.removeLayer(marker);
    });
    this.stationMarkers = [];
  }  private createPopupContent(station: any): string {
    // Obtener precios de diferentes combustibles
    const precioGasolina95 = station['Precio Gasolina 95 E5'];
    const precioGasoleoA = station['Precio Gasoleo A'];
    
    // Formatear precios
    const formatPrice = (price: string | number) => {
      if (!price || price === '' || price === ' ') return 'N/A';
      const numPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : price;
      return isNaN(numPrice) ? 'N/A' : `${numPrice.toFixed(3)} €`;
    };
    
    const gasolina95 = formatPrice(precioGasolina95);
    const gasoleoA = formatPrice(precioGasoleoA);
    const distancia = station.distance ? `${station.distance.toFixed(2)} km` : '?';
    
    return `
      <div class="popup-content">
        <div class="popup-header">
          <h6 class="fw-bold text-primary mb-1">
            <i class="fas fa-gas-pump me-2"></i>
            ${station.Rótulo || 'Sin nombre'}
          </h6>
        </div>
        <div class="popup-body">
          <p class="mb-2 text-muted small">
            <i class="fas fa-map-marker-alt me-2"></i>
            ${station.Dirección || 'Dirección no disponible'}
          </p>
          <p class="mb-2 text-muted small">
            <i class="fas fa-city me-2"></i>
            ${station.Municipio || 'Municipio no disponible'}
          </p>
          
          <!-- Precios de combustibles -->
          <div class="fuel-prices mb-3">
            <div class="row">
              <div class="col-6">
                <div class="price-card p-2 border rounded">
                  <div class="d-flex align-items-center mb-1">
                    <i class="fas fa-gas-pump text-success me-1"></i>
                    <small class="fw-semibold text-success">Gasolina 95</small>
                  </div>
                  <div class="fw-bold text-success">${gasolina95}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="price-card p-2 border rounded">
                  <div class="d-flex align-items-center mb-1">
                    <i class="fas fa-oil-can text-warning me-1"></i>
                    <small class="fw-semibold text-warning">Gasóleo A</small>
                  </div>
                  <div class="fw-bold text-warning">${gasoleoA}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-center">
            <div class="distance-info text-center">
              <small class="text-muted">Distancia:</small>
              <div class="fw-bold text-info">${distancia}</div>
            </div>
          </div>
        </div>
      </div>
      <style>
        .popup-content { 
          font-family: system-ui, -apple-system, sans-serif; 
          min-width: 280px;
        }
        .popup-header { 
          border-bottom: 1px solid #e9ecef; 
          padding-bottom: 8px; 
          margin-bottom: 12px; 
        }
        .popup-body { 
          min-width: 250px; 
        }
        .price-card {
          background: #f8f9fa;
          border-color: #e9ecef !important;
          text-align: center;
          transition: all 0.2s ease;
        }
        .price-card:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        .fuel-prices {
          background: white;
          border-radius: 8px;
          padding: 8px;
        }
        .distance-info { 
          text-align: center; 
          background: #f8f9fa;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
      </style>
    `;
  }

  // Métodos para los botones de control del mapa
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  centerOnUser(): void {
    if (this.map && this.currentLocation.lat !== 0 && this.currentLocation.lng !== 0) {
      this.map.setView([this.currentLocation.lat, this.currentLocation.lng], this.defaultZoom);
      if (this.userMarker) {
        this.userMarker.openPopup();
      }
    }
  }
}
