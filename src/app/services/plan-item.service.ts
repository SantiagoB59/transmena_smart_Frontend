
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environment/environment';

export interface PlanItemArticulo {
  id?: number;
  plan_item_id?: number;
  nombre: string;
  cantidad: number;
}

export interface PlanItem {
  id?: number;
  sistema: string;
  nombre: string;
  descripcion?: string | null;
  tipo_mantenimiento: 'PREVENTIVO' | 'INSPECCION' | 'CORRECTIVO';
  tipo_control: 'KM' | 'DIAS' | 'HORAS' | 'OCASIONAL';
  frecuencia_valor?: number | null;
  alerta_valor?: number | null;
  obligatorio: boolean;
  activo?: boolean;
  articulos: PlanItemArticulo[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanItemService {

  private api = `${environment.apiUrl}/api/plan-items`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PlanItem[]> {
    return this.http.get<PlanItem[]>(this.api);
  }

  getById(id: number): Observable<PlanItem> {
    return this.http.get<PlanItem>(`${this.api}/${id}`);
  }

  create(data: PlanItem): Observable<PlanItem> {
    return this.http.post<PlanItem>(this.api, data);
  }

  update(id: number, data: Partial<PlanItem>): Observable<PlanItem> {
    return this.http.put<PlanItem>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.api}/${id}`);
  }
}
