import {
  Component,
  OnInit
} from '@angular/core';

import {
  ReportesService
} from 'src/app/services/reportes.service';

import {
  VehiculoService
} from 'src/app/services/vehiculo.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})

export class ReportesComponent
implements OnInit {

  // =====================================================
  // STATE
  // =====================================================

  loading = false;

  tab = 'alertas';

  // =====================================================
  // DATA
  // =====================================================

  alertas: any[] = [];

  mantenimientos: any[] = [];

  vehiculos: any[] = [];

  semaforo: any = {

    criticas: 0,

    altas: 0,

    medias: 0,

    bajas: 0
  };

  // =====================================================
  // FILTROS
  // =====================================================

  filtros = {

    tipo: 'mensual',

    categoria: '',

    vehiculo_id: '',

    fecha_inicio: '',

    fecha_fin: ''
  };

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private reportesService:
      ReportesService,

    private vehiculoService:
      VehiculoService

  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.cargarVehiculos();

    this.cargarTodo();
  }

  // =====================================================
  // CARGAR TODO
  // =====================================================

  cargarTodo(): void {

    this.cargarAlertas();

    this.cargarMantenimientos();

    this.cargarSemaforo();
  }

  // =====================================================
  // VEHÍCULOS
  // =====================================================

  cargarVehiculos(): void {

    this.vehiculoService

      .listar({})

      .subscribe({

        next: (resp: any) => {

          this.vehiculos = resp;
        },

        error: (err) => {

          console.error(
            'Error vehículos:',
            err
          );
        }
      });
  }

  // =====================================================
  // ALERTAS
  // =====================================================

  cargarAlertas(): void {

  this.loading = true;

  this.reportesService
    .getAlertas(this.filtros)
    .subscribe({

      next: (resp: any) => {

        console.log('ALERTAS =>', resp);

        this.alertas = resp;

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
}

  // =====================================================
  // MANTENIMIENTOS
  // =====================================================

  cargarMantenimientos(): void {

    this.reportesService

      .getMantenimientos(
        this.filtros
      )

      .subscribe({

        next: (resp: any) => {

          this.mantenimientos =
            resp;
        },

        error: (err) => {

          console.error(
            'Error mantenimientos:',
            err
          );
        }
      });
  }

  // =====================================================
  // SEMÁFORO
  // =====================================================

  cargarSemaforo(): void {

    this.reportesService

      .getSemaforo()

      .subscribe({

        next: (resp: any) => {

          this.semaforo = resp;
        },

        error: (err) => {

          console.error(
            'Error semáforo:',
            err
          );
        }
      });
  }

  // =====================================================
  // FILTRAR
  // =====================================================

  aplicarFiltros(): void {

    this.cargarAlertas();

    this.cargarMantenimientos();
  }

  // =====================================================
  // CAMBIAR TAB
  // =====================================================

  cambiarTab(
    tab: string
  ): void {

    this.tab = tab;
  }

  // =====================================================
  // CLASE PRIORIDAD
  // =====================================================

  getClasePrioridad(
    prioridad: string
  ): string {

    switch (prioridad) {

      case 'CRITICA':

        return `
          bg-red-100
          text-red-700
        `;

      case 'ALTA':

        return `
          bg-orange-100
          text-orange-700
        `;

      case 'MEDIA':

        return `
          bg-yellow-100
          text-yellow-700
        `;

      case 'BAJA':

        return `
          bg-green-100
          text-green-700
        `;

      default:

        return `
          bg-blue-100
          text-blue-700
        `;
    }
  }

  // =====================================================
  // EXPORTAR ALERTAS
  // =====================================================

  exportarExcelAlertas(): void {

    this.reportesService

      .descargarExcelAlertas(
        this.filtros
      )

      .subscribe({

        next: (blob: Blob) => {

          const url =
            window.URL
              .createObjectURL(
                blob
              );

          const a =
            document
              .createElement('a');

          a.href = url;

          a.download =
            `REPORTE_ALERTAS_${Date.now()}.xlsx`;

          a.click();

          window.URL
            .revokeObjectURL(
              url
            );
        },

        error: (err) => {

          console.error(

            'Error descargando Excel:',

            err
          );
        }
      });
  }

exportarExcelMantenimientos(): void {

  // =========================================
  // VALIDAR VEHÍCULO
  // =========================================

  if (!this.filtros.vehiculo_id) {

    alert(
      'Debes seleccionar un vehículo'
    );

    return;
  }

  this.reportesService

    .descargarFormatoMantenimiento(
      Number(this.filtros.vehiculo_id)
    )

    .subscribe({

      next: (blob: Blob) => {

        const url =
          window.URL.createObjectURL(
            blob
          );

        const a =
          document.createElement('a');

        a.href = url;

        a.download =
          `HOJA_VIDA_${this.filtros.vehiculo_id}.xlsx`;

        a.click();

        window.URL.revokeObjectURL(
          url
        );
      },

      error: (err) => {

        console.error(
          'Error descargando mantenimiento:',
          err
        );
      }
    });
}


exportarExcelAlertasFormato(): void {

  // =========================================
  // VALIDAR VEHÍCULO
  // =========================================

  if (!this.filtros.vehiculo_id) {

    alert('Debes seleccionar un vehículo');

    return;
  }

  this.reportesService

    .descargarFormatoAlertas(
      Number(this.filtros.vehiculo_id)
    )

    .subscribe({

      next: (blob: Blob) => {

        const url =
          window.URL.createObjectURL(blob);

        const a =
          document.createElement('a');

        a.href = url;

        a.download =
          `HOJA_ALERTAS_${this.filtros.vehiculo_id}.xlsx`;

        a.click();

        window.URL.revokeObjectURL(url);
      },

      error: (err) => {

        console.error(
          'Error descargando alertas:',
          err
        );
      }
    });
}

}