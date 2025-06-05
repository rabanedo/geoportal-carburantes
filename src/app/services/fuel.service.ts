import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuelService {
  private estacionesEndpoint = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  private comunidadesEndpoint = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ComunidadesAutonomas/';

  constructor(private http: HttpClient) {}  
  
  getStationsAndDate() {
    return this.http.get<any>(this.estacionesEndpoint).pipe(
      timeout(15000), // 15 segundos de timeout
      map(data => {
        return {
          stations: data.ListaEESSPrecio,
          fecha: data.Fecha
        };
      }),
      catchError(error => {
        console.error('Error en getStations:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Método para obtener las comunidades autónomas desde la API oficial
  getComunidadesAutonomas() {
  return this.http.get<any[]>(this.comunidadesEndpoint).pipe(
    timeout(10000), // 10 segundos de timeout
    map(comunidades => {
      // Devuelve un objeto { [IDCCAA]: CCAA }
      const mapa: { [id: string]: string } = {};
      comunidades.forEach(c => {
        if (c.IDCCAA && c.CCAA) {
          mapa[c.CCAA] = c.IDCCAA;
        }
      });
      return mapa;
    }),
    catchError(error => {
      console.error('Error obteniendo comunidades autónomas:', error);
      return throwError(() => error);
    })
  );
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

  filterByFuelType(stations: any[], fuelType: string) {
    return stations.filter(est => est[fuelType] !== '' && est[fuelType] !== ' ' && !isNaN(parseFloat(est[fuelType].replace(',', '.'))));
  }
}
