import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
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
        [disabled]="!comunidades.length || !stations.length"
      >
        <option value="" disabled selected hidden>
          {{ !comunidades.length ? 'Cargando comunidades...' : 'Seleccione una comunidad' }}
        </option>
        <option *ngFor="let c of comunidades" [value]="c">
          {{ c }}
        </option>
      </select>
      @if (!comunidades.length) {
        <div class="d-flex align-items-center mt-2">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <small class="text-muted">Obteniendo comunidades autónomas...</small>
        </div>
      }
    </div>

    <!-- Provincia -->
    <div class="mb-4" *ngIf="provinciasFiltradas.length > 0">
      <label for="provinciaSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-city me-2 text-success"></i>
        Provincia
      </label>
      <select
        id="provinciaSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onProvinciaChange($event)"
        [value]="provinciaSeleccionada"
      >
        <option value="" selected hidden>Seleccione una provincia</option>
        <option *ngFor="let p of provinciasFiltradas; trackBy: trackByValue" [value]="p">
          {{ p }}
        </option>
      </select>
      <small class="form-text text-muted mt-1">
        <i class="fas fa-info-circle me-1"></i>
        {{ provinciasFiltradas.length }} provincias disponibles
      </small>
    </div>

    <!-- Municipio -->
    <div class="mb-4" *ngIf="municipios && municipios.length > 0">
      <label for="municipioSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-map-pin me-2 text-danger"></i>
        Municipio
      </label>
      <select
        id="municipioSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onMunicipioChange($event)"
        [value]="municipioSeleccionado"
      >
        <option value="" selected hidden>Seleccione un municipio</option>
        <option *ngFor="let m of municipios" [value]="m">
          {{ m }}
        </option>
      </select>
      <small class="form-text text-muted mt-1">
        <i class="fas fa-info-circle me-1"></i>
        {{ municipios.length }} municipios disponibles
      </small>
    </div>

    <!-- Carburante -->
    <div class="mb-4" *ngIf="provinciaSeleccionada">
      <label for="fuelSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-gas-pump me-2 text-warning"></i>
        Tipo de carburante
      </label>
      <select
        id="fuelSelect"
        class="form-select form-select-lg shadow-sm"
        (change)="onFuelChange($event)"
        [value]="fuelSeleccionado"
      >
        <option value="" selected hidden>Seleccione tipo de carburante</option>
        <option *ngFor="let type of fuelTypes" [value]="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>

    <!-- Fecha de consulta -->
    <div class="mb-4">
      <label for="fechaSelect" class="form-label fw-semibold text-dark">
        <i class="fas fa-calendar-alt me-2 text-info"></i>
        Fecha de consulta (3 últimos meses)
      </label>
      <input
        id="fechaSelect"
        type="date"
        class="form-control form-control-lg shadow-sm"
        [value]="fechaSeleccionada"
        [min]="minFecha"
        [max]="maxFecha"
        (change)="onFechaChange($event)"
      />
    </div>

    <!-- Panel informativo -->
    <div *ngIf="!provinciaSeleccionada && !provinciasFiltradas.length" class="text-center py-4">
      <div class="mb-3">
        <i class="fas fa-search-location fa-3x text-muted opacity-50"></i>
      </div>
      <h6 class="text-muted">Comienza tu búsqueda</h6>
      <p class="small text-muted mb-0">
        Selecciona una comunidad autónoma para ver las opciones disponibles
      </p>
    </div>
  `,
  styles: [`
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
    }
  `]
})
export class FilterComponent implements OnChanges {
  @Input() stations: any[] = [];
  @Input() comunidades: string[] = [];
  @Input() provincias: string[] = [];
  @Input() municipios: string[] = [];
  @Input() municipioSeleccionado: string = '';
  @Input() fechaSeleccionada: string = '';
  @Input() provinciaSeleccionada: string = '';
  @Input() fuelSeleccionado: string = '';

  @Output() fuelSelected = new EventEmitter<string>();
  @Output() comunidadSelected = new EventEmitter<string>();
  @Output() provinciaSelected = new EventEmitter<string>();
  @Output() municipioSelected = new EventEmitter<string>();
  @Output() fechaSelected = new EventEmitter<string>();

  provinciasFiltradas: string[] = [];

  fuelTypes = [
    { label: 'Gasolina 95', value: 'Precio Gasolina 95 E5' },
    { label: 'Gasóleo A', value: 'Precio Gasoleo A' },
    { label: 'Gasolina 98', value: 'Precio Gasolina 98 E5' }
  ];

  minFecha: string = '';
  maxFecha: string = '';

  ngOnInit() {
    const hoy = new Date();
    const haceTresMeses = new Date();
    haceTresMeses.setMonth(hoy.getMonth() - 3);

    // Formato YYYY-MM-DD
    this.maxFecha = hoy.toISOString().split('T')[0];
    this.minFecha = haceTresMeses.toISOString().split('T')[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provincias']) {
      this.provinciasFiltradas = this.provincias;
    }
    if (changes['provinciaSeleccionada']) {
      this.provinciaSeleccionada = changes['provinciaSeleccionada'].currentValue;
    }
    if (changes['fuelSeleccionado']) {
      this.fuelSeleccionado = changes['fuelSeleccionado'].currentValue;
    }
  }

  onComunidadChange(event: Event) {
    const comunidad = (event.target as HTMLSelectElement).value;
    if (comunidad) {
      this.provinciaSeleccionada = '';
      this.fuelSeleccionado = '';
      this.municipioSeleccionado = '';
      this.comunidadSelected.emit(comunidad);
      this.provinciaSelected.emit('');
      this.municipioSelected.emit('');
      this.fuelSelected.emit('');
    }
  }

  onProvinciaChange(event: Event) {
    const provincia = (event.target as HTMLSelectElement).value;
    this.provinciaSeleccionada = provincia;
    this.fuelSeleccionado = '';
    this.municipioSeleccionado = '';
    this.provinciaSelected.emit(provincia);
    this.municipioSelected.emit('');
    this.fuelSelected.emit('');
  }

  onMunicipioChange(event: Event) {
    const municipio = (event.target as HTMLSelectElement).value;
    this.municipioSeleccionado = municipio;
    this.municipioSelected.emit(municipio);
  }

  onFuelChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.fuelSeleccionado = value;
    this.fuelSelected.emit(value);
  }

  onFechaChange(event: Event) {
    const fecha = (event.target as HTMLInputElement).value;
    this.fechaSeleccionada = fecha;
    this.fechaSelected.emit(fecha);
  }

  trackByValue(index: number, value: string): string {
    return value;
  }
}
