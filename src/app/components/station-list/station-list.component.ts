import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule],  template: `
    <div class="station-list">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 text-primary fw-semibold">
          <i class="fas fa-list me-2"></i>
          Estaciones Cercanas
        </h6>
        <span class="badge bg-primary">{{ stations.length }}</span>
      </div>
      
      <div *ngIf="!stations.length" class="text-center py-4">
        <i class="fas fa-search fa-2x text-muted opacity-50 mb-3"></i>
        <p class="text-muted mb-0">No hay estaciones para mostrar</p>
        <small class="text-muted">Selecciona filtros para ver resultados</small>
      </div>
      
      <div class="station-item mb-3" *ngFor="let station of stations; let i = index">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="station-info flex-grow-1">
                <h6 class="card-title mb-1 text-dark fw-semibold">
                  <i class="fas fa-gas-pump text-primary me-2"></i>
                  {{ station['Rótulo'] || 'Sin nombre' }}
                </h6>
                <p class="card-text text-muted small mb-1">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  {{ station['Dirección'] }}
                </p>
                <p class="card-text text-muted small mb-0">
                  <i class="fas fa-city me-1"></i>
                  {{ station.Municipio }}, {{ station.Provincia }}
                </p>
              </div>
              <div class="station-rank">
                <span class="badge bg-secondary">#{{ i + 1 }}</span>
              </div>
            </div>
            
            <div class="row g-2 mt-2">
              <div class="col-6">
                <div class="d-flex align-items-center">
                  <i class="fas fa-euro-sign text-success me-2"></i>
                  <div>
                    <small class="text-muted d-block">Precio</small>
                    <span class="fw-bold text-success">
                      {{ station.Precio ? (station.Precio.toFixed(3) + ' €') : 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="d-flex align-items-center">
                  <i class="fas fa-route text-info me-2"></i>
                  <div>
                    <small class="text-muted d-block">Distancia</small>
                    <span class="fw-bold text-info">
                      {{ station.distance ? (station.distance.toFixed(2) + ' km') : '?' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-3 pt-2 border-top">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  <i class="fas fa-clock me-1"></i>
                  Actualizado: {{ station.Fecha || 'N/A' }}
                </small>
                <button class="btn btn-outline-primary btn-sm" (click)="onStationSelect(station)">
                  <i class="fas fa-eye me-1"></i>
                  Ver en mapa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="stations.length > 0" class="mt-3 text-center">
        <small class="text-muted">
          <i class="fas fa-info-circle me-1"></i>
          Mostrando las {{ stations.length }} estaciones más cercanas
        </small>
      </div>
    </div>
  `,
  styles: [`
    .station-list {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 5px;
    }
    
    .station-item {
      transition: all 0.3s ease;
    }
    
    .station-item:hover .card {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .card {
      border-left: 4px solid #0d6efd;
      transition: all 0.3s ease;
    }
    
    .card:hover {
      border-left-color: #0b5ed7;
    }
    
    .station-rank .badge {
      font-size: 0.7rem;
      padding: 0.35rem 0.5rem;
    }
    
    .btn-sm {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
    }
    
    .fa-2x {
      font-size: 2rem;
    }
    
    .opacity-50 {
      opacity: 0.5;
    }
    
    @media (max-width: 768px) {
      .station-list {
        max-height: 400px;
      }
      
      .card-body {
        padding: 1rem !important;
      }
      
      .btn-sm {
        font-size: 0.7rem;
        padding: 0.3rem 0.6rem;
      }
    }
  `]
})
export class StationListComponent {
  @Input() stations: any[] = [];
  
  onStationSelect(station: any): void {
    // Aquí se podría emitir un evento para centrar el mapa en la estación seleccionada
    console.log('Estación seleccionada:', station);
  }
}
