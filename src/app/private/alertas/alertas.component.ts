import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertasService }
  from 'src/app/services/alertas.service';

import { Alerta }
  from 'src/app/shared/models/alertas.model';


@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})

export class AlertasComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  alertas: Alerta[] = [];

  alertasPaginadas: Alerta[] = [];

  loading = false;

  ejecutandoMotor = false;

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  paginaActual = 1;

  itemsPorPagina = 10;

  totalPaginas = 1;

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  estadisticas = {

    total: 0,

    activas: 0,

    resueltas: 0,

    criticas: 0
  };

  // =====================================================
  // FILTROS
  // =====================================================

  filtros = {

    estado: '',

    prioridad: '',

    tipo: ''
  };


  modalDocumento = false;

  alertaSeleccionada!: Alerta;

  nuevaFecha = '';

  archivoDocumento!: File;
  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private alertasService: AlertasService, private router: Router

  ) { }

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.cargarTodo();
  }

  // =====================================================
  // CARGAR TODO
  // =====================================================

  cargarTodo(): void {

    this.cargarAlertas();

    this.cargarEstadisticas();
  }

  // =====================================================
  // CARGAR ALERTAS
  // =====================================================

  cargarAlertas(): void {

    this.loading = true;

    this.alertasService

      .listar(this.filtros)

      .subscribe({

        next: (resp) => {

          this.alertas = resp.sort(

            (a, b) =>
              this.getPesoPrioridad(b.prioridad)
              - this.getPesoPrioridad(a.prioridad)

          );

          // reiniciar página
          this.paginaActual = 1;

          // actualizar paginación
          this.actualizarPaginacion();

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'Error cargando alertas:',
            err
          );

          this.loading = false;
        }
      });
  }

  // =====================================================
  // CARGAR ESTADÍSTICAS
  // =====================================================

  cargarEstadisticas(): void {

    this.alertasService

      .obtenerEstadisticas()

      .subscribe({

        next: (resp) => {

          this.estadisticas = resp;
        },

        error: (err) => {

          console.error(
            'Error estadísticas:',
            err
          );
        }
      });
  }

  // =====================================================
  // FILTRAR
  // =====================================================

  filtrar(): void {

    this.cargarAlertas();
  }

  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  limpiarFiltros(): void {

    this.filtros = {

      estado: '',

      prioridad: '',

      tipo: ''
    };

    this.cargarAlertas();
  }

  // =====================================================
  // RESOLVER ALERTA
  // =====================================================

  resolver(id: number): void {

    const confirmar = confirm(
      '¿Deseas resolver esta alerta?'
    );

    if (!confirmar) return;

    this.alertasService

      .resolver(id)

      .subscribe({

        next: () => {

          this.cargarTodo();
        },

        error: (err) => {

          console.error(
            'Error resolviendo alerta:',
            err
          );
        }
      });
  }

  // =====================================================
  // IGNORAR ALERTA
  // =====================================================

  ignorar(id: number): void {

    const confirmar = confirm(
      '¿Deseas ignorar esta alerta?'
    );

    if (!confirmar) return;

    this.alertasService

      .ignorar(id)

      .subscribe({

        next: () => {

          this.cargarTodo();
        },

        error: (err) => {

          console.error(
            'Error ignorando alerta:',
            err
          );
        }
      });
  }

  // =====================================================
  // EJECUTAR MOTOR
  // =====================================================

  ejecutarMotor(): void {

    this.ejecutandoMotor = true;

    this.alertasService

      .ejecutarMotor()

      .subscribe({

        next: () => {

          this.ejecutandoMotor = false;

          this.cargarTodo();

          alert(
            'Motor de alertas ejecutado correctamente'
          );
        },

        error: (err) => {

          console.error(
            'Error ejecutando motor:',
            err
          );

          this.ejecutandoMotor = false;
        }
      });
  }

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  actualizarPaginacion(): void {

    this.totalPaginas = Math.ceil(
      this.alertas.length / this.itemsPorPagina
    );

    const inicio =
      (this.paginaActual - 1)
      * this.itemsPorPagina;

    const fin =
      inicio + this.itemsPorPagina;

    this.alertasPaginadas =
      this.alertas.slice(inicio, fin);
  }

  // =====================================================
  // CAMBIAR PÁGINA
  // =====================================================

  cambiarPagina(
    pagina: number
  ): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }

    this.paginaActual = pagina;

    this.actualizarPaginacion();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =====================================================
  // ARRAY PÁGINAS
  // =====================================================

  get paginas(): number[] {

    return Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );
  }

  // =====================================================
  // PESO PRIORIDAD
  // =====================================================

  getPesoPrioridad(
    prioridad: string
  ): number {

    switch (prioridad) {

      case 'CRITICA':
        return 4;

      case 'ALTA':
        return 3;

      case 'MEDIA':
        return 2;

      case 'BAJA':
        return 1;

      default:
        return 0;
    }
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
          border
          border-red-200
        `;

      case 'ALTA':

        return `
          bg-orange-100
          text-orange-700
          border
          border-orange-200
        `;

      case 'MEDIA':

        return `
          bg-yellow-100
          text-yellow-700
          border
          border-yellow-200
        `;

      case 'BAJA':

        return `
          bg-blue-100
          text-blue-700
          border
          border-blue-200
        `;

      default:

        return `
          bg-gray-100
          text-gray-700
          border
          border-gray-200
        `;
    }
  }

  // =====================================================
  // CLASE ESTADO
  // =====================================================

  getClaseEstado(
    estado: string
  ): string {

    switch (estado) {

      case 'ACTIVA':

        return `
          bg-red-100
          text-red-700
        `;

      case 'RESUELTA':

        return `
          bg-green-100
          text-green-700
        `;

      case 'IGNORADA':

        return `
          bg-gray-200
          text-gray-700
        `;

      default:

        return `
          bg-gray-100
          text-gray-700
        `;
    }
  }

  // =====================================================
  // ICONO ALERTA
  // =====================================================

  getIconoAlerta(
    tipo: string
  ): string {

    switch (tipo) {

      case 'DOCUMENTO':
        return '📄';

      case 'GPS':
        return '📍';

      case 'MANTENIMIENTO':
        return '🔧';

      default:
        return '🚨';
    }
  }

  // =====================================================
  // TRACK BY
  // =====================================================

  trackByAlerta(
    index: number,
    alerta: Alerta
  ): number {

    return alerta.id;
  }

  getFinPagina(): number {

    return Math.min(
      this.paginaActual * this.itemsPorPagina,
      this.alertas.length
    );
  }


abrirResolver(alerta: Alerta): void {

  // =====================================
  // DOCUMENTOS
  // =====================================

  if (alerta.tipo === 'DOCUMENTO') {

    this.alertaSeleccionada = alerta;

    this.modalDocumento = true;

    return;
  }

  // =====================================
  // MANTENIMIENTOS
  // =====================================

  if (alerta.tipo === 'MANTENIMIENTO') {

    this.router.navigate([
      '/dashboard/mantenimientos'
    ]);

    return;
  }

  // =====================================
  // GPS Y DEMÁS
  // =====================================

  this.resolver(alerta.id);
}

  onFileSelected(event: any): void {

    this.archivoDocumento =
      event.target.files[0];
  }

  resolverDocumento(): void {

    if (!this.nuevaFecha) {

      alert('Debes seleccionar fecha');

      return;
    }

    if (!this.archivoDocumento) {

      alert('Debes subir documento');

      return;
    }

    const formData = new FormData();

    formData.append(
      'fecha_vencimiento',
      this.nuevaFecha
    );

    formData.append(
      'archivo',
      this.archivoDocumento
    );

    // id del vehículo
    formData.append(
      'vehiculo_id',
      this.alertaSeleccionada.vehiculo_id!.toString()
    );

    // tipo documento
    formData.append(
      'categoria',
      this.alertaSeleccionada.categoria
    );

    // enviar backend
    this.alertasService
      .resolverDocumento(
        this.alertaSeleccionada.id,
        formData
      )
      .subscribe({

        next: () => {

          this.modalDocumento = false;

          this.cargarTodo();

          alert(
            'Documento actualizado correctamente'
          );
        },

        error: (err) => {

          console.error(err);
        }
      });
  }

}