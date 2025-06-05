import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuelService {
  private endpoint = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  private comunidadesEndpoint = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ComunidadesAutonomas/';

  constructor(private http: HttpClient) {}  getStations() {
    return this.http.get<any>(this.endpoint).pipe(
      timeout(15000), // 15 segundos de timeout
      map(data => {
        console.log('Respuesta completa de la API:', data); // Para depuración
        console.log('Claves de la respuesta:', Object.keys(data)); // Para ver todos los campos
        return data.ListaEESSPrecio;
      }),
      catchError(error => {
        console.error('Error en getStations:', error);
        return throwError(() => error);
      })
    );
  }  // Nuevo método para obtener la fecha de actualización
  getStationsWithDate() {
    return this.http.get<any>(this.endpoint).pipe(
      timeout(15000), // 15 segundos de timeout
      map(data => {
        console.log('Respuesta completa de la API:', data); // Para depuración
        console.log('Claves de la respuesta:', Object.keys(data)); // Para ver todos los campos
          // Buscar campos comunes de fecha en la respuesta
        const fechaCampos = [
          'Fecha', 
          'FechaActualizacion', 
          'Fecha_Actualizacion',
          'fecha', 
          'FECHA',
          'DateCreated',
          'LastUpdate',
          'UltimaActualizacion',
          'Timestamp',
          'NotaInformativa', // A veces contiene fecha
          'Nota'
        ];
        
        let fechaEncontrada = null;
        for (const campo of fechaCampos) {
          if (data[campo]) {
            fechaEncontrada = data[campo];
            console.log(`Fecha encontrada en campo raíz '${campo}':`, fechaEncontrada);
            break;
          }
        }
        
        // Si no se encuentra en el nivel raíz, buscar en objetos anidados
        if (!fechaEncontrada && data.ResultadoConsulta) {
          for (const campo of fechaCampos) {
            if (data.ResultadoConsulta[campo]) {
              fechaEncontrada = data.ResultadoConsulta[campo];
              console.log(`Fecha encontrada en ResultadoConsulta.'${campo}':`, fechaEncontrada);
              break;
            }
          }
        }
        
        return {
          stations: data.ListaEESSPrecio,
          fecha: fechaEncontrada,
          rawData: data // Para depuración
        };
      }),
      catchError(error => {
        console.error('Error en getStationsWithDate:', error);
        return throwError(() => error);
      })
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
  // Método para obtener las comunidades autónomas desde la API oficial
  getComunidadesAutonomas() {
    return this.http.get<any[]>(this.comunidadesEndpoint).pipe(
      timeout(10000), // 10 segundos de timeout
      map(comunidades => {
        console.log('Comunidades desde API:', comunidades);
        // La API devuelve un array de objetos con IDCCAA y CCAA
        return comunidades.map(c => c.CCAA || c.Nombre || c.nombre).filter(nombre => nombre);
      }),
      catchError(error => {
        console.error('Error obteniendo comunidades autónomas:', error);
        return throwError(() => error);
      })
    );
  }  // Método mejorado para obtener estaciones con comunidades oficiales
  getStationsWithComunidades() {
    console.log('Obteniendo estaciones con comunidades oficiales...');
    
    return this.getStationsWithDate().pipe(
      timeout(20000), // 20 segundos de timeout total
      map(stationsResponse => {
        console.log('Datos de estaciones obtenidos, mapeando comunidades...');
        
        // Mapear las estaciones con los nombres oficiales de comunidades
        const mappedStations = stationsResponse.stations.map((station: any) => {
          const comunidadMapeada = this.mapearComunidadOficial(station.CCAA);
          return {
            ...station,
            CCAAOficial: comunidadMapeada
          };
        });
        
        console.log('Comunidades mapeadas correctamente');
        
        return {
          ...stationsResponse,
          stations: mappedStations
        };
      }),
      catchError(error => {
        console.error('Error en getStationsWithComunidades:', error);
        return throwError(() => error);
      })
    );
  }

  // Mapear nombres de comunidades a los nombres oficiales de la API
  private mapearComunidadOficial(comunidadEstacion: string): string {
    if (!comunidadEstacion) return comunidadEstacion;
    
    const mapeosComunidades: { [key: string]: string } = {
      'ANDALUCIA': 'Andalucía',
      'ARAGON': 'Aragón',
      'ASTURIAS': 'Asturias',
      'BALEARES': 'Baleares',
      'CANARIAS': 'Canarias',
      'CANTABRIA': 'Cantabria',
      'CASTILLA LA MANCHA': 'Castilla la Mancha',
      'CASTILLA Y LEON': 'Castilla y León',
      'CATALUÑA': 'Cataluña',
      'COMUNIDAD VALENCIANA': 'Comunidad Valenciana',
      'EXTREMADURA': 'Extremadura',
      'GALICIA': 'Galicia',
      'MADRID': 'Madrid',
      'MURCIA': 'Murcia',
      'NAVARRA': 'Navarra',
      'PAIS VASCO': 'País Vasco',
      'RIOJA': 'Rioja (La)',
      'LA RIOJA': 'Rioja (La)',
      'CEUTA': 'Ceuta',
      'MELILLA': 'Melilla'
    };
    
    const comunidadNormalizada = comunidadEstacion.toUpperCase().trim();
    return mapeosComunidades[comunidadNormalizada] || comunidadEstacion;
  }
}
