import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],  template: `
    <!-- Comunidad Autónoma -->
    <div class="mb-4">
      <label for="comunidadSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-map me-2 text-primary"></i>
        Comunidad Autónoma
      </label>
      <select 
        id="comunidadSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onComunidadChange($event)"
        [disabled]="!comunidades?.length"
      >
        <option value="" disabled selected>
          {{ !comunidades?.length ? 'Cargando comunidades...' : 'Seleccione una comunidad' }}
        </option>
        <option *ngFor="let c of comunidades" [value]="c">
          {{ c }}
        </option>
      </select>
      @if (!comunidades?.length) {
        <div class="d-flex align-items-center mt-2">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <small class="text-muted">Obteniendo comunidades autónomas...</small>
        </div>
      }
    </div>

    <!-- Provincia (solo si hay comunidad seleccionada) -->
    <div class="mb-4" *ngIf="provinciasFiltradas.length > 0">
      <label for="provinciaSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-city me-2 text-success"></i>
        Provincia
      </label>
      <select 
        id="provinciaSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onProvinciaChange($event)"
      >
        <option value="" disabled selected>Seleccione una provincia</option>
        <option *ngFor="let p of provinciasFiltradas" [value]="p">
          {{ p }}
        </option>
      </select>
      <small class="form-text text-muted mt-1">
        <i class="fas fa-info-circle me-1"></i>
        {{ provinciasFiltradas.length }} provincias disponibles
      </small>
    </div>

    <!-- Carburante (solo si hay provincia seleccionada) -->
    <div class="mb-4" *ngIf="provinciaSeleccionada">
      <label for="fuelSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-gas-pump me-2 text-warning"></i>
        Tipo de carburante
      </label>
      <select 
        id="fuelSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onSelect($event)"
      >
        <option value="" disabled selected>Seleccione tipo de carburante</option>
        <option *ngFor="let type of fuelTypes" [value]="type.value">
          <span>{{ type.label }}</span>
        </option>
      </select>
      <div class="mt-3">
        <div class="alert alert-info alert-dismissible fade show border-0 shadow-sm" role="alert">
          <i class="fas fa-lightbulb me-2"></i>
          <strong>Consejo:</strong> Selecciona tu tipo de carburante favorito para ver las 3 estaciones más cercanas con mejor precio.
        </div>
      </div>
    </div>

    <!-- Panel de información cuando no hay filtros -->
    <div *ngIf="!provinciaSeleccionada && !provinciasFiltradas.length" class="text-center py-4">
      <div class="mb-3">
        <i class="fas fa-search-location fa-3x text-muted opacity-50"></i>
      </div>
      <h6 class="text-muted">Comienza tu búsqueda</h6>
      <p class="small text-muted mb-0">
        Selecciona una comunidad autónoma para ver las opciones disponibles
      </p>
    </div>
  `,  styles: [`
    .form-select {
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .form-select:hover:not(:disabled) {
      border-color: #0d6efd;
    }
    
    .form-label {
      margin-bottom: 0.75rem;
      color: #495057;
    }
    
    .form-label i {
      width: 20px;
      text-align: center;
    }
    
    .alert {
      font-size: 0.875rem;
      border-left: 4px solid #0dcaf0;
    }
    
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
    
    .form-text {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
    }
    
    .fa-3x {
      font-size: 3rem;
    }
    
    .opacity-50 {
      opacity: 0.5;
    }
    
    @media (max-width: 768px) {
      .form-select-lg {
        font-size: 1rem;
        padding: 0.75rem 1rem;
      }
      
      .alert {
        font-size: 0.8rem;
        padding: 0.75rem;
      }
    }
  `]
})
export class FilterComponent implements OnChanges {
  @Output() fuelSelected = new EventEmitter<string>();
  @Output() comunidadSelected = new EventEmitter<string>();
  @Output() provinciaSelected = new EventEmitter<string>();

  @Input() comunidades: string[] = [];
  @Input() provincias: string[] = [];

  provinciasFiltradas: string[] = [];
  provinciaSeleccionada = '';

  fuelTypes = [
    { label: 'Gasolina 95', value: 'Precio Gasolina 95 E5' },
    { label: 'Gasóleo A', value: 'Precio Gasoleo A' },
    { label: 'Gasolina 98', value: 'Precio Gasolina 98 E5' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provincias'] && this.provincias) {
      this.provinciasFiltradas = this.provincias;
    }
  }

  onSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.fuelSelected.emit(value);
    }
  }

  onComunidadChange(event: Event) {
    const comunidad = (event.target as HTMLSelectElement).value;
    if (comunidad) {
      this.comunidadSelected.emit(comunidad);
    }
  }

  onProvinciaChange(event: Event) {
    const provincia = (event.target as HTMLSelectElement).value;
    if (provincia) {
      this.provinciaSeleccionada = provincia;
      this.provinciaSelected.emit(provincia);
    }
  }
}
