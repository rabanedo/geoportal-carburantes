import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FuelService {
  private endpoint = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

  constructor(private http: HttpClient) {}

  getStations() {
    return this.http.get<any>(this.endpoint).pipe(
      map(data => data.ListaEESSPrecio)
    );
  }

  filterByFuelType(stations: any[], fuelType: string) {
    return stations.filter(est => est[fuelType] !== '' && est[fuelType] !== ' ' && !isNaN(parseFloat(est[fuelType].replace(',', '.'))));
  }

  getDistinctValues(list: any[], key: string): string[] {
    if (!list || !list.length) return [];
    
    // Algunas estaciones pueden tener la propiedad como 'IDCCAA' o 'ComunidadAutónoma'
    const possibleKeys = [key, 'IDCCAA', 'ComunidadAutónoma', 'Comunidad', 'CCAA'];
    const validKey = possibleKeys.find(k => list.some(item => item[k] !== undefined));
    
    if (!validKey) return [];
    
    return Array.from(
      new Set(
        list
          .map(item => item[validKey])
          .filter(value => value !== undefined && value !== null && value !== '')
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  filterByComunidad(list: any[], comunidad: string): any[] {
    return list.filter(est => est.CCAA === comunidad);
  }

  filterByProvincia(list: any[], provincia: string): any[] {
    return list.filter(est => est.Provincia === provincia);
  }
}
