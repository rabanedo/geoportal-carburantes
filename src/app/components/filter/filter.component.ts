import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Comunidad Autónoma -->
    <div class="filter-group">
      <label for="comunidadSelect">Comunidad Autónoma</label>
      <select 
        id="comunidadSelect"
        (change)="onComunidadChange($event)"
        [disabled]="!comunidades?.length"
      >
        <option value="" disabled selected>Seleccione una comunidad</option>
        <option *ngFor="let c of comunidades" [value]="c">
          {{ c }}
        </option>
      </select>
      @if (!comunidades?.length) {
        <small class="loading-text">Cargando comunidades...</small>
      }
    </div>

    <!-- Provincia (solo si hay comunidad seleccionada) -->
    <div class="filter-group" *ngIf="provinciasFiltradas.length > 0">
      <label for="provinciaSelect">Provincia</label>
      <select 
        id="provinciaSelect"
        (change)="onProvinciaChange($event)"
      >
        <option value="" disabled selected>Seleccione una provincia</option>
        <option *ngFor="let p of provinciasFiltradas" [value]="p">
          {{ p }}
        </option>
      </select>
    </div>

    <!-- Carburante (solo si hay provincia seleccionada) -->
    <div class="filter-group" *ngIf="provinciaSeleccionada">
      <label for="fuelSelect">Tipo de carburante</label>
      <select 
        id="fuelSelect"
        (change)="onSelect($event)"
      >
        <option value="" disabled selected>Seleccione tipo de carburante</option>
        <option *ngFor="let type of fuelTypes" [value]="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .filter-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .loading-text {
      color: #666;
      font-style: italic;
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
