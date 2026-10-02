import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertCircle,
  LucideCalendar,
  LucideClock3,
  LucideDynamicIcon,
  LucideFileText,
  LucideInfo,
  LucidePencil,
  LucidePower,
  LucideSearch,
  LucideShieldCheck,
  LucideTrash2,
  LucideTriangleAlert,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';

interface ContractType {
  id: string;
  name: string;
  description: string;
  cycleDuration: string;
  chargeFrequency: string;
  origin: string;
  status: 'Activo' | 'Inactivo';
  durationDays: number;
  billingFactor: number;
}

@Component({
  selector: 'app-contract-types',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDynamicIcon],
  styleUrl: './contract-types.scss',
  templateUrl: './contract-types.html',
})
export class ContractTypesComponent {
  readonly icons = {
    calendar: LucideCalendar,
    search: LucideSearch,
    clock: LucideClock3,
    shieldCheck: LucideShieldCheck,
    pencil: LucidePencil,
    power: LucidePower,
    trash: LucideTrash2,
    alertCircle: LucideAlertCircle,
    triangleAlert: LucideTriangleAlert,
    info: LucideInfo,
    fileText: LucideFileText,
    x: LucideX,
  } satisfies Record<string, LucideIcon>;

  isActivateModalOpen = false;
  isDeactivateModalOpen = false;
  isDeleteModalOpen = false;
  selectedPeriod: ContractType | null = null;
  toastVisible = false;
  toastMessage = '';
  searchQuery = '';
  isCreateModalOpen = false;
  isEditModalOpen = false;
  periodForm: Partial<ContractType> = this.createEmptyPeriodForm();

  contractTypes: ContractType[] = [
    {
      id: '1',
      name: 'Pago Único',
      description: 'Cobro de una sola vez sin fecha de renovación periódica obligatoria.',
      cycleDuration: 'Sin límite (Pago único)',
      chargeFrequency: 'Única vez',
      origin: 'Sistema',
      status: 'Activo',
      durationDays: 0,
      billingFactor: 0,
    },
    {
      id: '2',
      name: 'Semana',
      description: 'Renovación y ciclo de cobro cada 7 días.',
      cycleDuration: '7 días',
      chargeFrequency: 'Cada 0.25 mes(es)',
      origin: 'Sistema',
      status: 'Activo',
      durationDays: 7,
      billingFactor: 0.25,
    },
    {
      id: '3',
      name: 'Mensual (30 Días)',
      description: 'Renovación estándar mensual cada 30 días.',
      cycleDuration: '30 días',
      chargeFrequency: 'Cada 1 mes(es)',
      origin: 'Sistema',
      status: 'Activo',
      durationDays: 30,
      billingFactor: 1,
    },
    {
      id: '4',
      name: 'Semestral (6 Meses)',
      description: 'Contratación por 6 meses con renovación cada 180 días.',
      cycleDuration: '180 días',
      chargeFrequency: 'Cada 6 mes(es)',
      origin: 'Sistema',
      status: 'Activo',
      durationDays: 180,
      billingFactor: 6,
    },
    {
      id: '5',
      name: 'Anual (12 Meses)',
      description: 'Contratación anual con descuento por permanencia.',
      cycleDuration: '365 días',
      chargeFrequency: 'Cada 12 mes(es)',
      origin: 'Sistema',
      status: 'Activo',
      durationDays: 365,
      billingFactor: 12,
    },
  ];

  get filteredPeriods(): ContractType[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.contractTypes;
    return this.contractTypes.filter((period) => period.name.toLowerCase().includes(query) || period.description.toLowerCase().includes(query));
  }

  openCreateModal(): void {
    this.selectedPeriod = null;
    this.periodForm = this.createEmptyPeriodForm();
    this.isCreateModalOpen = true;
  }

  openEditModal(period: ContractType): void {
    this.selectedPeriod = period;
    this.periodForm = { ...period };
    this.isEditModalOpen = true;
  }

  closeFormModals(): void {
    this.isCreateModalOpen = false;
    this.isEditModalOpen = false;
    this.periodForm = {};
  }

  savePeriod(): void {
    if (!this.periodForm.name?.trim()) return;
    const durationDays = Number(this.periodForm.durationDays) || 0;
    const billingFactor = Number(this.periodForm.billingFactor) || 0;
    const periodData = {
      name: this.periodForm.name.trim(),
      description: this.periodForm.description?.trim() || '',
      durationDays,
      billingFactor,
      cycleDuration: durationDays ? `${durationDays} días` : 'Sin límite (Pago único)',
      chargeFrequency: billingFactor ? `Cada ${billingFactor} mes(es)` : 'Única vez',
      status: this.periodForm.status || 'Activo',
    } as const;

    if (this.isEditModalOpen && this.selectedPeriod) {
      Object.assign(this.selectedPeriod, periodData);
      this.showToastNotification(`Periodo "${periodData.name}" actualizado.`);
    } else {
      this.contractTypes.push({
        ...periodData,
        id: Date.now().toString(),
        origin: 'Usuario',
      });
      this.showToastNotification(`Periodo "${periodData.name}" creado con éxito.`);
    }
    this.closeFormModals();
  }

  onToggleStatusClick(period: ContractType): void {
    this.selectedPeriod = period;
    if (period.status === 'Inactivo') this.isActivateModalOpen = true;
    else this.isDeactivateModalOpen = true;
  }

  onDeleteClick(period: ContractType): void {
    this.selectedPeriod = period;
    this.isDeleteModalOpen = true;
  }

  closeModal(): void {
    this.isActivateModalOpen = false;
    this.isDeactivateModalOpen = false;
    this.isDeleteModalOpen = false;
    this.selectedPeriod = null;
  }

  confirmActivatePeriod(): void {
    if (!this.selectedPeriod) return;
    this.selectedPeriod.status = 'Activo';
    this.showToastNotification(`El periodo "${this.selectedPeriod.name}" ha sido activado.`);
    this.closeModal();
  }

  confirmDeactivatePeriod(): void {
    if (!this.selectedPeriod) return;
    this.selectedPeriod.status = 'Inactivo';
    this.showToastNotification(`El periodo "${this.selectedPeriod.name}" ha sido desactivado.`);
    this.closeModal();
  }

  confirmDeletePeriod(): void {
    if (!this.selectedPeriod) return;
    const deletedName = this.selectedPeriod.name;
    this.contractTypes = this.contractTypes.filter((period) => period.id !== this.selectedPeriod?.id);
    this.showToastNotification(`El periodo "${deletedName}" ha sido eliminado.`);
    this.closeModal();
  }

  closeToast(): void {
    this.toastVisible = false;
  }

  private showToastNotification(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    window.setTimeout(() => this.closeToast(), 4000);
  }

  private createEmptyPeriodForm(): Partial<ContractType> {
    return { name: '', durationDays: 30, billingFactor: 1, description: '', status: 'Activo' };
  }
}
