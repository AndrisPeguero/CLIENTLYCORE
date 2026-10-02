import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { ClientsService } from '../../core/services/clients.service';
import {
  LucideAlertTriangle,
  LucideBuilding2,
  LucideCheckCircle,
  LucideChevronDown,
  LucideClock3,
  LucideDynamicIcon,
  LucideEye,
  LucideMail,
  LucideMapPin,
  LucidePackage,
  LucidePencil,
  LucidePhone,
  LucidePlus,
  LucidePower,
  LucideRotateCw,
  LucideSearch,
  LucideTrash2,
  LucideUser,
  LucideUsers,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';

interface ContractedService {
  id: string;
  serviceName: string;
  serviceType: string;
  category: string;
  contractDate: string;
  renewalDate?: string;
  monthlyFee: string;
  totalAmount: string;
  status: string;
}

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  rnc: string;
  status: 'Activo' | 'Inactivo';
  address: string;
  notes: string;
  services: ContractedService[];
}

interface ConfirmationModal {
  type: 'activate' | 'deactivate' | 'delete';
  title: string;
  message: string;
  iconColor: 'orange' | 'red';
  buttonColor: 'orange' | 'red';
  buttonText: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, FormsModule],
  styleUrl: './clients.scss',
  templateUrl: './clients.html',
})
export class ClientsComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly appState: AppStateService,
    private readonly clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.clientsService.clients$.subscribe(data => {
      // Mapear datos del servicio al formato del componente
      this.clients = data.map(client => ({
        id: client.id,
        companyName: client.name,
        contactName: client.contactName || '',
        email: client.email || '',
        phone: client.phone || '',
        rnc: '',
        status: client.status,
        address: '',
        notes: '',
        services: []
      }));
      this.appState.setClientsCount(this.clients.length);
    });
  }
  readonly icons = {
    users: LucideUsers,
    user: LucideUser,
    search: LucideSearch,
    chevronDown: LucideChevronDown,
    building: LucideBuilding2,
    mail: LucideMail,
    phone: LucidePhone,
    package: LucidePackage,
    plus: LucidePlus,
    eye: LucideEye,
    pencil: LucidePencil,
    power: LucidePower,
    rotateCw: LucideRotateCw,
    trash: LucideTrash2,
    x: LucideX,
    alertTriangle: LucideAlertTriangle,
    clock: LucideClock3,
    mapPin: LucideMapPin,
    checkCircle: LucideCheckCircle,
  } satisfies Record<string, LucideIcon>;

  // Modal control flags
  isRegisterModalOpen = false;
  isEditModalOpen = false;
  isDetailModalOpen = false;
  isConfirmModalOpen = false;
  isRenewModalOpen = false;

  // Selected items
  selectedClient: Client | null = null;
  selectedServiceToRenew: ContractedService | null = null;
  confirmationConfig: ConfirmationModal | null = null;
  newRenewalDate = '';

  // Filter properties
  searchTerm = '';
  statusFilter: 'todos' | 'activos' | 'inactivos' = 'todos';

  // Form data
  formData: Partial<Client> = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    rnc: '',
    status: 'Activo',
    address: '',
    notes: '',
    services: [],
  };

  // Client list
  clients: Client[] = [];

  // Computed property for filtered clients
  get filteredClients(): Client[] {
    return this.clients.filter((client) => {
      // Status filter
      if (this.statusFilter === 'activos' && client.status !== 'Activo') return false;
      if (this.statusFilter === 'inactivos' && client.status !== 'Inactivo') return false;

      // Search filter (case-insensitive)
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        return (
          client.companyName.toLowerCase().includes(term) ||
          client.contactName.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.rnc.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  // Modal methods
  openRegisterModal(): void {
    this.resetForm();
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
    this.resetForm();
  }

  openDetailModal(client: Client): void {
    this.selectedClient = JSON.parse(JSON.stringify(client)); // Deep copy
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedClient = null;
  }

  onAddContractForClient(client: Client): void {
    this.router.navigate(['/contracted-services'], { queryParams: { action: 'new', clientId: client.id } });
  }

  openContractServiceModal(client: Client): void {
    this.onAddContractForClient(client);
  }

  openRenewalFromClientDetail(service: ContractedService, client: Client): void {
    this.selectedClient = client;
    this.openRenewModal(service);
  }

  openEditModal(client: Client): void {
    this.selectedClient = JSON.parse(JSON.stringify(client));
    this.formData = JSON.parse(JSON.stringify(client));
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedClient = null;
    this.resetForm();
  }

  openConfirmationModal(type: 'activate' | 'deactivate' | 'delete', client: Client): void {
    this.selectedClient = client;

    if (type === 'deactivate') {
      this.confirmationConfig = {
        type: 'deactivate',
        title: '¿Desactivar Cliente?',
        message: `¿Está seguro de desactivar al cliente "${client.companyName}"? Sus servicios contratados no se perderán pero figurarán congelados.`,
        iconColor: 'orange',
        buttonColor: 'orange',
        buttonText: 'Sí, continuar',
      };
    } else if (type === 'activate') {
      this.confirmationConfig = {
        type: 'activate',
        title: '¿Activar Cliente?',
        message: `¿Desea reactivar al cliente "${client.companyName}"?`,
        iconColor: 'orange',
        buttonColor: 'orange',
        buttonText: 'Sí, continuar',
      };
    } else if (type === 'delete') {
      this.confirmationConfig = {
        type: 'delete',
        title: '¿Eliminar Cliente?',
        message: `¿Está seguro de que desea eliminar permanentemente a "${client.companyName}" (${client.contactName})? Esta acción eliminará también todas sus contrataciones registradas.`,
        iconColor: 'red',
        buttonColor: 'red',
        buttonText: 'Sí, continuar',
      };
    }

    this.isConfirmModalOpen = true;
  }

  closeConfirmationModal(): void {
    this.isConfirmModalOpen = false;
    this.confirmationConfig = null;
    this.selectedClient = null;
  }

  openRenewModal(service: ContractedService): void {
    this.selectedServiceToRenew = service;

    const baseDate = service.renewalDate || service.contractDate || new Date().toISOString().slice(0, 10);
    const parsedDate = new Date(baseDate);
    const fallbackDate = new Date();

    if (Number.isNaN(parsedDate.getTime())) {
      fallbackDate.setDate(fallbackDate.getDate() + 30);
      this.newRenewalDate = fallbackDate.toISOString().split('T')[0];
    } else {
      parsedDate.setDate(parsedDate.getDate() + 30);
      this.newRenewalDate = parsedDate.toISOString().split('T')[0];
    }

    this.isRenewModalOpen = true;
  }

  confirmRenewal(): void {
    if (this.selectedServiceToRenew && this.newRenewalDate) {
      this.selectedServiceToRenew.renewalDate = this.newRenewalDate;
      this.closeRenewModal();
    }
  }

  closeRenewModal(): void {
    this.isRenewModalOpen = false;
    this.selectedServiceToRenew = null;
    this.newRenewalDate = '';
  }

  // Form methods
  registerClient(): void {
    if (!this.formData.companyName || !this.formData.contactName || !this.formData.email) {
      alert('Por favor complete los campos obligatorios (*): Empresa, Contacto y Correo');
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      companyName: this.formData.companyName || '',
      contactName: this.formData.contactName || '',
      email: this.formData.email || '',
      phone: this.formData.phone || '',
      rnc: this.formData.rnc || '',
      status: this.formData.status || 'Activo',
      address: this.formData.address || '',
      notes: this.formData.notes || '',
      services: [],
    };

    this.clients.unshift(newClient);
    this.appState.setClientsCount(this.clients.length);
    this.closeRegisterModal();
  }

  editClient(): void {
    if (!this.formData.companyName || !this.formData.contactName || !this.formData.email) {
      alert('Por favor complete los campos obligatorios (*): Empresa, Contacto y Correo');
      return;
    }

    if (this.selectedClient) {
      const index = this.clients.findIndex((c) => c.id === this.selectedClient!.id);
      if (index !== -1) {
        this.clients[index] = {
          ...this.selectedClient,
          companyName: this.formData.companyName || '',
          contactName: this.formData.contactName || '',
          email: this.formData.email || '',
          phone: this.formData.phone || '',
          rnc: this.formData.rnc || '',
          status: this.formData.status || 'Activo',
          address: this.formData.address || '',
          notes: this.formData.notes || '',
        };
      }
    }

    this.closeEditModal();
  }

  confirmAction(): void {
    if (!this.selectedClient || !this.confirmationConfig) return;

    if (this.confirmationConfig.type === 'activate' || this.confirmationConfig.type === 'deactivate') {
      const index = this.clients.findIndex((c) => c.id === this.selectedClient!.id);
      if (index !== -1) {
        this.clients[index].status = this.clients[index].status === 'Activo' ? 'Inactivo' : 'Activo';
      }
    } else if (this.confirmationConfig.type === 'delete') {
      const index = this.clients.findIndex((c) => c.id === this.selectedClient!.id);
      if (index !== -1) {
        this.clients.splice(index, 1);
        this.appState.setClientsCount(this.clients.length);
      }
    }

    this.closeConfirmationModal();
  }

  cancelAction(): void {
    this.closeConfirmationModal();
  }

  resetForm(): void {
    this.formData = {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      rnc: '',
      status: 'Activo',
      address: '',
      notes: '',
      services: [],
    };
  }

  // Helpers
  toggleClientStatus(client: Client): void {
    const type = client.status === 'Activo' ? 'deactivate' : 'activate';
    this.openConfirmationModal(type, client);
  }

  deleteClient(client: Client): void {
    this.openConfirmationModal('delete', client);
  }

  getTotalMonthlyFee(services: ContractedService[]): string {
    const total = services.reduce((sum, service) => {
      const amount = parseFloat(service.monthlyFee.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return total > 0 ? `US$${total.toFixed(2)}` : 'US$0.00';
  }
}
