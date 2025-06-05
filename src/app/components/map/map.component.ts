import * as L from 'leaflet';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { icon, Marker, LatLng } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map" style="height: 500px;"></div>`
})
export class MapComponent implements OnChanges {
  @Input() stations: any[] = [];
  @Input() currentLocation: { lat: number, lng: number } = { lat: 0, lng: 0 };

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private stationMarkers: L.Marker[] = [];
  private readonly defaultZoom = 13;

  private readonly defaultIcon = icon({
    iconUrl: 'assets/leaflet/marker-icon.png',
    iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });

  private readonly userIcon = icon({
    ...this.defaultIcon.options,
    iconUrl: 'assets/leaflet/marker-icon-blue.png'
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
      }).addTo(this.map);

      // Configurar icono por defecto para todos los marcadores
      Marker.prototype.options.icon = this.defaultIcon;

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
    }

    // Añadir nuevo marcador
    this.userMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
      icon: this.userIcon,
      zIndexOffset: 1000 // Para asegurar que esté encima de otros marcadores
    }).addTo(this.map!)
      .bindPopup('Tu ubicación actual')
      .openPopup();
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Limpiar marcadores existentes
    this.clearStationMarkers();

    // Añadir nuevos marcadores
    this.stationMarkers = this.stations
      .filter(station => station.parsedLat && station.parsedLng)
      .map(station => {
        const marker = L.marker([station.parsedLat, station.parsedLng])
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
  }

  private createPopupContent(station: any): string {
    return `
      <b>${station.Rótulo || 'Sin nombre'}</b><br>
      ${station.Dirección || 'Dirección no disponible'}<br>
      ${station.Municipio || 'Municipio no disponible'}<br>
      <strong>Precio:</strong> ${station.Precio || 'N/A'}<br>
      <strong>Distancia:</strong> ${station.distance?.toFixed(2) || '?'} km
    `;
  }
}
