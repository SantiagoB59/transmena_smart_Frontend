import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environment/environment';
import { Mantenimiento } from '../shared/models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  private base = `${environment.apiUrl}/api/mantenimientos`;

  constructor(private http: HttpClient) {}

  // ==========================
  // LISTADO
  // ==========================
  listar(filters?: {
    vehiculo_id?: number;
    tipo?: string;
    desde?: string;
    hasta?: string;
    search?: string;
  }): Observable<Mantenimiento[]> {

    let params = new HttpParams();

    if (filters?.vehiculo_id) {
      params = params.set('vehiculo_id', filters.vehiculo_id);
    }

    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
    }

    if (filters?.desde) {
      params = params.set('desde', filters.desde);
    }

    if (filters?.hasta) {
      params = params.set('hasta', filters.hasta);
    }

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<Mantenimiento[]>(this.base, { params });
  }

  // ==========================
  // DETALLE VEHICULO
  // ==========================
  porVehiculo(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/vehiculo/${id}`);
  }

  // ==========================
  // CREAR
  // ==========================
  crear(data: FormData): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.base, data);
  }

  // ==========================
  // VEHICULOS
  // ==========================
  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/vehiculos-simple`);
  }

  // ==========================
  // PLAN POR VEHICULO (CORREGIDO)
  // ==========================
  getPlanPorVehiculo(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.base}/vehiculo-plan/${id}`
    );
  }
}