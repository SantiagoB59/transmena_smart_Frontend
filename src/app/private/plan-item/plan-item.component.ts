import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { PlanItemService } from 'src/app/services/plan-item.service';
import { SistemasService } from 'src/app/services/sistemas.service';
@Component({
  selector: 'app-plan-item',
  templateUrl: './plan-item.component.html',
  styleUrls: ['./plan-item.component.scss']
})
export class PlanItemComponent implements OnInit {

  planItems: any[] = [];
  filteredItems: any[] = [];

  loading = false;
  saving = false;
  error = '';

  searchTerm = '';
  filtroSistema = '';
  filtroTipoControl = '';

  showModal = false;
  showConfirm = false;

  modalMode: 'crear' | 'editar' | 'ver' = 'crear';

  titulo = 'Nuevo mantenimiento';

  itemSeleccionado: any = null;
  itemEliminar: any = null;

  form!: FormGroup;

  sistemas: any[] = [];

  tiposMantenimiento = [
    'PREVENTIVO',
    'CORRECTIVO',
    'INSPECCION'
  ];

  tiposControl = [
    'KM',
    'DIAS',
    'HORAS',
    'OCASIONAL'
  ];

  constructor(
    private fb: FormBuilder,
    private planItemService: PlanItemService,
    private sistemasService: SistemasService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarSistemas();
    this.cargarDatos();
  }

  // =========================
  // FORM (PLAN BASE)
  // =========================
  initForm(): void {
    this.form = this.fb.group({
      sistema: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo_mantenimiento: ['PREVENTIVO', Validators.required],
      tipo_control: ['KM', Validators.required],
      obligatorio: [true],
      articulos: this.fb.array([])
    });
  }

  // =========================
  // DATA
  // =========================
  cargarDatos(): void {

    this.loading = true;

    this.planItemService.getAll()
      .subscribe({

        next: (resp) => {
          this.planItems = resp || [];
          this.filtrar();
          this.loading = false;
        },

        error: (err) => {
          console.error(err);
          this.error = 'Error cargando plan de mantenimiento';
          this.loading = false;
        }

      });

  }
  // =========================
  // FILTER
  // =========================
  filtrar(): void {

    this.filteredItems = this.planItems.filter(i => {

      const matchSearch =
        !this.searchTerm ||
        i.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        i.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchSistema =
        !this.filtroSistema ||
        i.sistema === this.filtroSistema;

      const matchControl =
        !this.filtroTipoControl ||
        i.tipo_control === this.filtroTipoControl;

      return matchSearch && matchSistema && matchControl;
    });
  }

  // =========================
  // MODAL
  // =========================
  abrirCrear(): void {
    this.modalMode = 'crear';
    this.titulo = 'Nuevo mantenimiento';
    this.itemSeleccionado = null;

    this.form.enable();

    this.form.reset({
      sistema: '',
      nombre: '',
      descripcion: '',
      tipo_mantenimiento: 'PREVENTIVO',
      tipo_control: 'KM',
      obligatorio: true
    });

    this.limpiarArticulos();
    this.showModal = true;
  }

  abrirEditar(item: any): void {
    this.modalMode = 'editar';
    this.titulo = 'Editar mantenimiento';
    this.itemSeleccionado = item;

    this.form.enable();
    this.limpiarArticulos();

    this.form.patchValue(item);
    this.cargarArticulos(item.articulos || []);

    this.showModal = true;
  }

  abrirVer(item: any): void {
    this.modalMode = 'ver';
    this.titulo = 'Detalle mantenimiento';
    this.itemSeleccionado = item;

    this.form.enable();
    this.limpiarArticulos();

    this.form.patchValue(item);
    this.cargarArticulos(item.articulos || []);

    this.form.disable();
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.form.enable();
    this.form.reset();
    this.limpiarArticulos();
  }
  // =========================
  // SAVE
  // =========================
  guardar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = this.form.value;

    if (this.modalMode === 'crear') {

      this.planItemService.create(payload)
        .subscribe({

          next: () => {
            this.saving = false;
            this.cerrarModal();
            this.cargarDatos();
          },

          error: (err) => {
            console.error(err);
            this.error = 'Error creando mantenimiento';
            this.saving = false;
          }

        });

      return;
    }

    this.planItemService.update(
      this.itemSeleccionado.id,
      payload
    ).subscribe({

      next: () => {
        this.saving = false;
        this.cerrarModal();
        this.cargarDatos();
      },

      error: (err) => {
        console.error(err);
        this.error = 'Error actualizando mantenimiento';
        this.saving = false;
      }

    });
  }

  // =========================
  // DELETE
  // =========================
  confirmarEliminar(item: any): void {
    this.itemEliminar = item;
    this.showConfirm = true;
  }

  eliminar(): void {

    this.planItemService.delete(this.itemEliminar.id)
      .subscribe({

        next: () => {
          this.showConfirm = false;
          this.itemEliminar = null;
          this.cargarDatos();
        },

        error: (err) => {
          console.error(err);
          this.error = 'Error eliminando mantenimiento';
        }

      });
  }

  // =========================
  // HELPERS
  // =========================
  estadoClass(activo: boolean): string {
    return activo ? 'badge-operativo' : 'badge-inactivo';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }


  cargarSistemas(): void {

    this.sistemasService.listar()
      .subscribe({

        next: (resp) => {
          this.sistemas = resp || [];
        },

        error: (err) => {
          console.error('Error sistemas', err);
        }

      });

  }

  // =========================
  // ARTÍCULOS DEL MANTENIMIENTO
  // =========================

  get articulos(): FormArray {
    return this.form.get('articulos') as FormArray;
  }


  agregarArticulo(articulo?: any): void {
    this.articulos.push(
      this.fb.group({
        nombre: [
          articulo?.nombre || '',
          [
            Validators.required,
            Validators.maxLength(150)
          ]
        ],
        cantidad: [
          articulo?.cantidad ?? 1,
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^[1-9]\d*$/)
          ]
        ],
        fecha_vencimiento: [
          articulo?.fecha_vencimiento || ''
        ]
      })
    );
  }


  eliminarArticulo(index: number): void {
    this.articulos.removeAt(index);
  }

  private limpiarArticulos(): void {
    while (this.articulos.length > 0) {
      this.articulos.removeAt(0);
    }
  }

  private cargarArticulos(articulos: any[] = []): void {
    this.limpiarArticulos();

    articulos.forEach(articulo => {
      this.agregarArticulo(articulo);
    });
  }
}