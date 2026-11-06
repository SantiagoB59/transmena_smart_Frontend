import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MantenimientoPlanService } from '../../services/mantenimiento-plan.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { MaquinariaService } from '../../services/maquinaria.service';

interface PlanVehiculo {

  id: number;

  vehiculo_id?: number;

  maquinaria_id?: number;

  plan_item: any;

  sistema: string;

  nombre: string;

  descripcion: string;

  tipo_mantenimiento: string;

  tipo_control: 'KM' | 'DIAS' | 'HORAS';

  frecuencia_valor: number;

  alerta_valor: number;

  ultimo_km?: number;

  ultima_horas?: number;

  ultima_fecha?: string;

  km_total?: number;

  programado: any;

  restante: number;

  estado: string;
  horometro_actual?: number;

  tiene_articulos?: boolean;

  inventario?: any[];
}

@Component({
  selector: 'app-mantenimiento-plan',
  templateUrl: './mantenimiento-plan.component.html',
  styleUrls: ['./mantenimiento-plan.component.scss']
})
export class MantenimientoPlanComponent implements OnInit {

  // =========================
  // ROUTE PARAMS
  // =========================
  tipo!: 'vehiculo' | 'maquinaria';

  entityId!: number;

  // =========================
  // DATA
  // =========================
  vehiculo: any = null;

  maquinaria: any = null;

  planes: PlanVehiculo[] = [];

  planItems: any[] = [];

  // =========================
  // MODAL
  // =========================
  showModal = false;

  // =========================
  // FORM
  // =========================
  plan_item_id = 0;

  tipo_control: 'KM' | 'DIAS' | 'HORAS' = 'KM';

  frecuencia_valor = 0;

  alerta_valor = 0;

  notas = '';

  // =========================
  // INVENTARIO DE ARTÍCULOS
  // =========================
  showInventarioModal = false;

  inventarioLoading = false;

  inventarioError = '';

  inventario: any = null;

  planInventarioSeleccionado: PlanVehiculo | null = null;

  // =========================
  // LOTE
  // =========================
  showLoteModal = false;

  savingLote = false;

  loteError = '';

  loteEditando: any = null;

  loteArticulo: any = null;

  loteCantidad = 1;

  loteFecha = '';

  constructor(
    private service: MantenimientoPlanService,
    private vehiculoService: VehiculoService,
    private maquinariaService: MaquinariaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    // =========================
    // PARAMS
    // =========================
    this.tipo = this.route.snapshot.paramMap.get(
      'tipo'
    ) as 'vehiculo' | 'maquinaria';

    this.entityId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    // =========================
    // VALIDAR
    // =========================
    if (!this.entityId || !this.tipo) {

      this.router.navigate(['/dashboard/flota']);

      return;
    }

    // =========================
    // VEHÍCULO
    // =========================
    if (this.tipo === 'vehiculo') {

      this.cargarVehiculo();

      this.cargarPlanesVehiculo();
    }

    // =========================
    // MAQUINARIA
    // =========================
    if (this.tipo === 'maquinaria') {

      this.cargarMaquinaria();

      this.cargarPlanesMaquinaria();
    }

    // =========================
    // CATÁLOGO PLAN ITEMS
    // =========================
    this.cargarPlanItems();
  }

  // =====================================
  // VEHÍCULO
  // =====================================
  cargarVehiculo(): void {

    this.vehiculoService
      .obtenerPorId(this.entityId)
      .subscribe({

        next: (res) => {
          this.vehiculo = res;
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  // =====================================
  // MAQUINARIA
  // =====================================
  cargarMaquinaria(): void {

  this.maquinariaService
    .getById(this.entityId)
    .subscribe({

      next: (res) => {

        console.log("MAQUINARIA:", res);

        this.maquinaria = res;

      },

      error: (err) => {
        console.error(err);
      }
    });
}

  // =====================================
  // PLANES VEHÍCULO
  // =====================================
  cargarPlanesVehiculo(): void {

    this.service
      .getPlanVehiculo(this.entityId)
      .subscribe({

        next: (res) => {
          this.planes = res;
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  // =====================================
  // PLANES MAQUINARIA
  // =====================================
  cargarPlanesMaquinaria(): void {

    this.service
      .getPlanMaquinaria(this.entityId)
      .subscribe({

        next: (res) => {
          this.planes = res;
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  // =====================================
  // PLAN ITEMS
  // =====================================
  cargarPlanItems(): void {

    this.service.getPlanItems()
      .subscribe({

        next: (res) => {
          this.planItems = res;
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  // =====================================
  // MODAL
  // =====================================
  abrirModal(): void {
    this.showModal = true;
  }

  cerrarModal(): void {

    this.showModal = false;

    this.resetForm();
  }

  // =====================================
  // RESET FORM
  // =====================================
  resetForm(): void {

    this.plan_item_id = 0;

    this.tipo_control = 'KM';

    this.frecuencia_valor = 0;

    this.alerta_valor = 0;

    this.notas = '';
  }

  // =====================================
  // CAMBIO PLAN ITEM
  // =====================================
  onPlanItemChange(): void {

    const plan = this.planItems.find(
      p => p.id == this.plan_item_id
    );

    if (plan) {

      this.tipo_control =
        plan.tipo_control || 'KM';

      this.frecuencia_valor =
        plan.frecuencia_valor || 0;

      this.alerta_valor =
        plan.alerta_valor || 0;
    }
  }

  // =====================================
  // GUARDAR
  // =====================================
  guardar(): void {

    // =========================
    // VEHÍCULO
    // =========================
    if (this.tipo === 'vehiculo') {

      const data = {

        plan_item_id: this.plan_item_id,

        tipo_control: this.tipo_control,

        frecuencia_valor: this.frecuencia_valor,

        alerta_valor: this.alerta_valor
      };

      this.service
        .crearPlan(this.entityId, data)
        .subscribe({

          next: () => {

            this.cerrarModal();

            this.cargarPlanesVehiculo();
          },

          error: (err) => {
            console.error(err);
          }
        });
    }

    // =========================
    // MAQUINARIA
    // =========================
    if (this.tipo === 'maquinaria') {

      const data = {

        plan_item_id: this.plan_item_id,

        frecuencia_horas: this.frecuencia_valor,

        alerta_horas: this.alerta_valor
      };

      this.service
        .crearPlanMaquinaria(this.entityId, data)
        .subscribe({

          next: () => {

            this.cerrarModal();

            this.cargarPlanesMaquinaria();
          },

          error: (err) => {
            console.error(err);
          }
        });
    }
  }

  // =====================================
  // COMPLETAR
  // =====================================
  completar(id: number): void {

    // =========================
    // VEHÍCULO
    // =========================
    if (this.tipo === 'vehiculo') {

      this.service
        .completarPlan(id)
        .subscribe({

          next: () => {
            this.cargarPlanesVehiculo();
          },

          error: (err) => {
            console.error(err);
          }
        });
    }

    // =========================
    // MAQUINARIA
    // =========================
    if (this.tipo === 'maquinaria') {

      this.service
        .completarPlanMaquinaria(id)
        .subscribe({

          next: () => {
            this.cargarPlanesMaquinaria();
          },

          error: (err) => {
            console.error(err);
          }
        });
    }
  }

  // =====================================
  // INVENTARIO DE ARTÍCULOS
  // =====================================
  puedeAdministrarArticulos(plan: PlanVehiculo): boolean {

    if (this.tipo !== 'vehiculo') {
      return false;
    }

    return !!(
      plan?.tiene_articulos ||
      plan?.plan_item?.articulos?.length
    );
  }

  abrirInventario(plan: PlanVehiculo): void {

    this.planInventarioSeleccionado = plan;

    this.inventario = null;

    this.inventarioError = '';

    this.showInventarioModal = true;

    this.cargarInventario();
  }

  cerrarInventario(): void {

    this.showInventarioModal = false;

    this.planInventarioSeleccionado = null;

    this.inventario = null;

    this.inventarioError = '';

    this.cerrarLoteModal();
  }

  cargarInventario(): void {

    if (!this.planInventarioSeleccionado) {
      return;
    }

    this.inventarioLoading = true;

    this.service
      .getInventarioPlan(
        this.entityId,
        this.planInventarioSeleccionado.id
      )
      .subscribe({

        next: (res) => {

          this.inventario = res;

          this.inventarioLoading = false;
        },

        error: (err) => {

          console.error(err);

          this.inventarioError =
            err?.error?.error ||
            'No fue posible cargar el inventario del vehículo.';

          this.inventarioLoading = false;
        }
      });
  }

  // =====================================
  // LOTES
  // =====================================
  abrirNuevoLote(articulo: any): void {

    this.loteEditando = null;

    this.loteArticulo = articulo;

    this.loteCantidad =
      articulo?.cantidad_minima || 1;

    this.loteFecha = '';

    this.loteError = '';

    this.showLoteModal = true;
  }

  abrirEditarLote(articulo: any, lote: any): void {

    this.loteEditando = lote;

    this.loteArticulo = articulo;

    this.loteCantidad = lote.cantidad;

    this.loteFecha = lote.fecha_vencimiento || '';

    this.loteError = '';

    this.showLoteModal = true;
  }

  cerrarLoteModal(): void {

    this.showLoteModal = false;

    this.loteEditando = null;

    this.loteArticulo = null;

    this.loteError = '';

    this.savingLote = false;
  }

  guardarLote(): void {

    if (!this.planInventarioSeleccionado || !this.loteArticulo) {
      return;
    }

    const cantidad = Number(this.loteCantidad);

    if (!Number.isInteger(cantidad) || cantidad < 1) {

      this.loteError =
        'La cantidad debe ser un entero mayor que cero.';

      return;
    }

    this.savingLote = true;

    this.loteError = '';

    const data = {
      cantidad,
      fecha_vencimiento: this.loteFecha || null
    };

    const peticion = this.loteEditando
      ? this.service.actualizarLote(
          this.entityId,
          this.planInventarioSeleccionado.id,
          this.loteEditando.id,
          data
        )
      : this.service.agregarLote(
          this.entityId,
          this.planInventarioSeleccionado.id,
          this.loteArticulo.plan_item_detalle_id,
          data
        );

    peticion.subscribe({

      next: () => {

        this.savingLote = false;

        this.cerrarLoteModal();

        this.cargarInventario();
      },

      error: (err) => {

        console.error(err);

        this.loteError =
          err?.error?.error ||
          'No fue posible guardar el lote.';

        this.savingLote = false;
      }
    });
  }

  eliminarLote(articulo: any, lote: any): void {

    if (!this.planInventarioSeleccionado) {
      return;
    }

    const confirmar = confirm(
      `¿Eliminar el lote de "${articulo.nombre}" con cantidad ${lote.cantidad}?`
    );

    if (!confirmar) {
      return;
    }

    this.service
      .eliminarLote(
        this.entityId,
        this.planInventarioSeleccionado.id,
        lote.id
      )
      .subscribe({

        next: () => {
          this.cargarInventario();
        },

        error: (err) => {

          console.error(err);

          this.inventarioError =
            err?.error?.error ||
            'No fue posible eliminar el lote.';
        }
      });
  }

  // =====================================
  // ESTADOS DE ARTÍCULOS
  // =====================================
  estadoArticuloClass(estado: string): string {

    switch (estado) {

      case 'VIGENTE':
        return 'estado-articulo vigente';

      case 'PROXIMO':
        return 'estado-articulo proximo';

      case 'VENCIDO':
        return 'estado-articulo vencido';

      case 'SIN_FECHA':
        return 'estado-articulo sin-fecha';

      default:
        return 'estado-articulo sin-registro';
    }
  }

  estadoArticuloLabel(estado: string): string {

    switch (estado) {

      case 'VIGENTE':
        return 'Vigente';

      case 'PROXIMO':
        return 'Próximo a vencer';

      case 'VENCIDO':
        return 'Vencido';

      case 'SIN_FECHA':
        return 'Sin vencimiento';

      case 'SIN_REGISTRO':
        return 'Sin registrar';

      default:
        return estado || 'Sin estado';
    }
  }

  formatearFecha(fecha: string | null): string {

    if (!fecha) {
      return 'Sin vencimiento';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // =====================================
  // BADGES
  // =====================================
  estadoClass(estado: string): string {

    switch (estado) {

      case 'ACTIVO':
        return 'badge-operativo';

      case 'PENDIENTE':
        return 'badge-taller';

      case 'VENCIDO':
        return 'badge-inactivo';

      default:
        return 'badge-default';
    }
  }

  // =====================================
  // VOLVER
  // =====================================
  volver(): void {

    this.router.navigate(['/dashboard/flota']);
  }
}