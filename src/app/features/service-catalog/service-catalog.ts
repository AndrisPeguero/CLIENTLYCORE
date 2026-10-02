import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertTriangle,
  LucideChevronDown,
  LucideDynamicIcon,
  LucideFileText,
  LucideInfo,
  LucidePackage,
  LucidePencil,
  LucidePower,
  LucideSearch,
  LucideTag,
  LucideTrash2,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';

type ServiceCategory = 'Desarrollo & Web' | 'SaaS & Licencias' | 'Infraestructura' | 'Soporte' | 'Consultoría' | 'General';
type ServiceStatus = 'Activo (Disponible)' | 'Inactivo' | 'Disponible';

interface Service {
  id: string;
  name: string;
  code: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  status: ServiceStatus;
}

@Component({
  selector: 'app-service-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDynamicIcon],
  styleUrl: './service-catalog.scss',
  templateUrl: './service-catalog.html',
})
export class ServiceCatalogComponent {
  readonly icons = {
    package: LucidePackage,
    search: LucideSearch,
    chevronDown: LucideChevronDown,
    tag: LucideTag,
    pencil: LucidePencil,
    power: LucidePower,
    trash: LucideTrash2,
    alertTriangle: LucideAlertTriangle,
    info: LucideInfo,
    fileText: LucideFileText,
    x: LucideX,
  } satisfies Record<string, LucideIcon>;

  readonly categories: ServiceCategory[] = ['Desarrollo & Web', 'SaaS & Licencias', 'Infraestructura', 'Soporte', 'Consultoría', 'General'];
  readonly statuses: ServiceStatus[] = ['Activo (Disponible)', 'Disponible', 'Inactivo'];
  searchQuery = '';
  selectedCategory = '';
  isFormModalOpen = false;
  isDeactivateModalOpen = false;
  isActivateModalOpen = false;
  isDeleteModalOpen = false;
  isEditing = false;
  selectedService: Service | null = null;
  toastVisible = false;
  toastTitle = '';
  toastMessage = '';
  formData: Partial<Service> = {};

  services: Service[] = [
    {
      id: '1',
      name: 'Mantenimiento Web Premium',
      code: 'SRV-WEB-MAINT',
      category: 'Desarrollo & Web',
      description: 'Actualizaciones de seguridad, backups diarios y monitoreo 2...',
      basePrice: 150,
      status: 'Activo (Disponible)',
    },
    {
      id: '2',
      name: 'Licencia Software ERP Nube',
      code: 'SRV-ERP-CLOUD',
      category: 'SaaS & Licencias',
      description: 'Acceso multiusuario a la plataforma de gestión empresarial.',
      basePrice: 350,
      status: 'Activo (Disponible)',
    },
    {
      id: '3',
      name: 'Hosting Dedicado & Cloud VPS',
      code: 'SRV-HOSTING-VPS',
      category: 'Infraestructura',
      description: 'Servidor privado virtual de alto rendimiento con IP dedicada.',
      basePrice: 80,
      status: 'Activo (Disponible)',
    },
    {
      id: '4',
      name: 'Soporte Técnico VIP In-Site',
      code: 'SRV-SUPP-VIP',
      category: 'Soporte',
      description: 'Atención prioritaria presencial y telefónica para incidencias i...',
      basePrice: 200,
      status: 'Activo (Disponible)',
    },
    {
      id: '5',
      name: 'Auditoría de Ciberseguridad',
      code: 'SRV-SEC-AUDIT',
      category: 'Consultoría',
      description: 'Análisis de vulnerabilidades, pruebas de penetración y repor...',
      basePrice: 1200,
      status: 'Activo (Disponible)',
    },
  ];

  get filteredServices(): Service[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.services.filter((service) => {
      const matchesText = !query || [service.name, service.code, service.description].some((value) => value.toLowerCase().includes(query));
      return matchesText && (!this.selectedCategory || service.category === this.selectedCategory);
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedService = null;
    this.formData = { name: '', code: '', category: 'General', basePrice: 0, status: 'Activo (Disponible)', description: '' };
    this.isFormModalOpen = true;
  }

  openEditModal(item: Service): void {
    this.isEditing = true;
    this.selectedService = item;
    this.formData = { ...item };
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.selectedService = null;
    this.formData = {};
  }

  saveService(): void {
    if (!this.formData.name?.trim() || !this.formData.category) return;
    const service: Service = {
      id: this.selectedService?.id || `service-${Date.now()}`,
      name: this.formData.name.trim(),
      code: this.formData.code?.trim() || `SRV-${Date.now()}`,
      category: this.formData.category,
      basePrice: Number(this.formData.basePrice) || 0,
      status: this.formData.status || 'Activo (Disponible)',
      description: this.formData.description?.trim() || '',
    };
    const index = this.services.findIndex((item) => item.id === service.id);
    if (index === -1) this.services.unshift(service);
    else this.services[index] = service;
    this.closeFormModal();
  }

  openDeactivateModal(item: Service): void {
    this.selectedService = item;
    this.isDeactivateModalOpen = true;
  }

  closeDeactivateModal(): void {
    this.isDeactivateModalOpen = false;
    this.selectedService = null;
  }

  confirmDeactivate(): void {
    if (!this.selectedService) return;
    this.selectedService.status = 'Inactivo';
    this.showToast(this.selectedService);
    this.closeDeactivateModal();
  }

  onToggleStatusClick(item: Service): void {
    this.selectedService = item;
    if (item.status === 'Inactivo') {
      this.isActivateModalOpen = true;
    } else {
      this.openDeactivateModal(item);
    }
  }

  toggleServiceStatus(item: Service): void {
    this.onToggleStatusClick(item);
  }

  closeActivateModal(): void {
    this.isActivateModalOpen = false;
    this.selectedService = null;
  }

  confirmActivateService(): void {
    if (!this.selectedService) return;
    this.selectedService.status = 'Disponible';
    this.showToastNotification(`El servicio "${this.selectedService.name}" ahora está Disponible.`);
    this.closeActivateModal();
  }

  openDeleteModal(item: Service): void {
    this.selectedService = item;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedService = null;
  }

  confirmDelete(): void {
    if (!this.selectedService) return;
    this.services = this.services.filter((item) => item.id !== this.selectedService?.id);
    this.closeDeleteModal();
  }

  closeToast(): void {
    this.toastVisible = false;
  }

  private showToast(item: Service, inactive = true): void {
    this.toastTitle = 'Estado de Servicio Cambiado';
    this.toastMessage = `El servicio "${item.name}" ahora está ${inactive ? 'Inactivo' : 'Activo (Disponible)'}.`;
    this.toastVisible = true;
    window.setTimeout(() => this.closeToast(), 4000);
  }

  private showToastNotification(message: string): void {
    this.toastTitle = 'Estado de Servicio Cambiado';
    this.toastMessage = message;
    this.toastVisible = true;
    window.setTimeout(() => this.closeToast(), 4000);
  }
}
