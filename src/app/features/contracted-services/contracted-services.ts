import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { ContractedServicesService } from '../../core/services/contracted-services.service';
import {
  LucideAlertTriangle,
  LucideBuilding2,
  LucideCalendar,
  LucideChevronDown,
  LucideClock3,
  LucideDynamicIcon,
  LucideFileText,
  LucidePackage,
  LucidePencil,
  LucidePlus,
  LucideRefreshCw,
  LucideSearch,
  LucideTrash2,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';

interface ContractedService {
  id: string;
  client: string;
  contact: string;
  serviceName: string;
  category: string;
  period: 'Pago Único' | 'Semanal' | 'Mensual' | 'Semestral' | 'Anual';
  contractDate: string;
  renewalDate?: string;
  renewalLabel?: string;
  monthly?: string;
  amount: string;
  status: 'Activo' | 'Inactivo' | 'Pendiente de Renovación' | 'Vendido / Vencido' | 'Vencido' | 'Suspendido' | 'Cancelado';
  manualStatus?: boolean;
}

@Component({
  selector: 'app-contracted-services',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDynamicIcon],
  styleUrl: './contracted-services.scss',
  templateUrl: './contracted-services.html',
})
export class ContractedServicesComponent implements OnInit {
  readonly icons = {
    fileText: LucideFileText,
    search: LucideSearch,
    plus: LucidePlus,
    chevronDown: LucideChevronDown,
    building: LucideBuilding2,
    package: LucidePackage,
    calendar: LucideCalendar,
    clock: LucideClock3,
    refresh: LucideRefreshCw,
    pencil: LucidePencil,
    trash: LucideTrash2,
    alertTriangle: LucideAlertTriangle,
    x: LucideX,
  } satisfies Record<string, LucideIcon>;

  readonly periods = ['Pago Único', 'Semanal', 'Mensual', 'Semestral', 'Anual'] as const;
  readonly statuses = ['Activo', 'Pendiente de Renovación', 'Vendido / Vencido', 'Vencido', 'Suspendido', 'Cancelado'] as const;

  searchTerm = '';
  clientFilter = '';
  selectedClientFilter = '';
  statusFilter = '';
  periodFilter = '';
  isFormModalOpen = false;
  isRenewModalOpen = false;
  isDeleteModalOpen = false;
  isEditing = false;
  selectedContract: ContractedService | null = null;
  newRenewalDate = '';
  formData: Partial<ContractedService> = {};
  isClientDropdownOpen = false;
  isServiceDropdownOpen = false;

  constructor(
    route: ActivatedRoute, 
    private readonly appState: AppStateService,
    private readonly contractedServicesService: ContractedServicesService
  ) {
    this.appState.setContractedServicesCount(this.contracts.length);
    route.queryParamMap.subscribe((params) => {
      if (params.get('action') === 'new') {
        this.openNewContractModal();
        const clientId = params.get('clientId');
        const clientById: Record<string, string> = {
          '1': 'Andris RD',
          '2': 'TechSolutions Dominicana SRL',
          '3': 'Inversiones Rivas & Asociados',
        };
        if (clientId && clientById[clientId]) this.formData.client = clientById[clientId];
      }
    });
  }

  ngOnInit(): void {
    this.contractedServicesService.contracts$.subscribe(data => {
      // Convertir datos del servicio al formato del componente
      this.contracts = data.map(contract => ({
        id: contract.id,
        client: contract.clientName,
        contact: '',
        serviceName: contract.serviceName,
        category: '',
        period: contract.period as 'Pago Único' | 'Semanal' | 'Mensual' | 'Semestral' | 'Anual',
        contractDate: contract.startDate,
        renewalDate: contract.renewalDate,
        renewalLabel: '',
        monthly: `US$${contract.monthlyCost.toFixed(2)}/mes`,
        amount: contract.monthlyCost.toString(),
        status: contract.status as any,
        manualStatus: false
      }));
      this.appState.setContractedServicesCount(this.contracts.length);
    });
  }

  contracts: ContractedService[] = [];

  get clients(): string[] {
    return [...new Set(this.contracts.map((contract) => contract.client))];
  }

  get services(): string[] {
    return [...new Set(this.contracts.map((contract) => contract.serviceName))];
  }

  get filteredClients(): string[] {
    const query = this.clientFilter.trim().toLowerCase();
    return this.clients.filter((client) => !query || client.toLowerCase().includes(query));
  }

  get filteredServices(): string[] {
    const query = String(this.formData.serviceName || '').trim().toLowerCase();
    return this.services.filter((service) => !query || service.toLowerCase().includes(query));
  }

  get filteredContracts(): ContractedService[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.contracts.filter((contract) => {
      const matchesSearch = !query || [contract.client, contract.contact, contract.serviceName].some((value) => value.toLowerCase().includes(query));
      const clientQuery = (this.selectedClientFilter || this.clientFilter).trim().toLowerCase();
      const matchesClient = !clientQuery || contract.client.toLowerCase().includes(clientQuery);
      const matchesStatus = !this.statusFilter || this.getContractStatus(contract) === this.statusFilter;
      const matchesPeriod = !this.periodFilter || contract.period === this.periodFilter;
      return matchesSearch && matchesClient && matchesStatus && matchesPeriod;
    });
  }

  updateContractStatus(contract: ContractedService): void {
    contract.status = this.getContractStatus(contract);
  }

  getContractStatus(contract: ContractedService): ContractedService['status'] {
    if (contract.manualStatus || contract.status === 'Cancelado' || contract.status === 'Suspendido') {
      return contract.status;
    }

    if (!contract.renewalDate || contract.period === 'Pago Único') {
      return 'Activo';
    }

    const today = this.startOfToday();
    const renewal = this.parseDate(contract.renewalDate);
    renewal.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 7) return 'Pendiente de Renovación';
    return 'Activo';
  }

  selectClient(client: string): void {
    this.formData.client = client;
    this.isClientDropdownOpen = false;
  }

  selectService(service: string): void {
    this.formData.serviceName = service;
    this.isServiceDropdownOpen = false;
  }

  openNewContractModal(): void {
    this.isEditing = false;
    this.formData = { client: '', serviceName: '', period: 'Mensual', contractDate: this.formatDate(new Date()), amount: '', status: 'Activo' };
    this.isFormModalOpen = true;
    this.isClientDropdownOpen = false;
    this.isServiceDropdownOpen = false;
  }

  openEditModal(contract: ContractedService): void {
    this.isEditing = true;
    this.selectedContract = contract;
    this.formData = { ...contract };
    this.isFormModalOpen = true;
    this.isClientDropdownOpen = false;
    this.isServiceDropdownOpen = false;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.selectedContract = null;
    this.formData = {};
    this.isClientDropdownOpen = false;
    this.isServiceDropdownOpen = false;
  }

  saveContract(): void {
    if (!this.formData.client || !this.formData.serviceName || !this.formData.period || !this.formData.amount) return;
    const contract: ContractedService = {
      id: this.selectedContract?.id || `contract-${Date.now()}`,
      client: this.formData.client,
      contact: this.formData.contact || '',
      serviceName: this.formData.serviceName,
      category: this.formData.category || 'General',
      period: this.formData.period,
      contractDate: this.formData.contractDate || this.formatDate(new Date()),
      renewalDate: this.formData.renewalDate,
      renewalLabel: this.formData.renewalLabel,
      monthly: this.formData.period === 'Pago Único' ? 'N/A' : `US$${this.formData.amount}/mes`,
      amount: this.formData.amount,
      status: (this.formData.status || 'Activo') as ContractedService['status'],
      manualStatus: this.formData.status === 'Cancelado' || this.formData.status === 'Suspendido',
    };
    const index = this.contracts.findIndex((item) => item.id === contract.id);
    if (index === -1) this.contracts.unshift(contract);
    else this.contracts[index] = contract;
    this.appState.setContractedServicesCount(this.contracts.length);
    this.updateContractStatus(contract);
    this.closeFormModal();
  }

  openRenewModal(contract: ContractedService): void {
    this.selectedContract = contract;
    const baseDate = this.parseDate(contract.renewalDate || contract.contractDate);
    baseDate.setDate(baseDate.getDate() + 30);
    this.newRenewalDate = this.formatDate(baseDate);
    this.isRenewModalOpen = true;
  }

  closeRenewModal(): void {
    this.isRenewModalOpen = false;
    this.selectedContract = null;
    this.newRenewalDate = '';
  }

  confirmRenewal(): void {
    if (!this.selectedContract || !this.newRenewalDate) return;
    this.selectedContract.renewalDate = this.formatDisplayDate(this.newRenewalDate);
    this.updateContractStatus(this.selectedContract);
    this.selectedContract.renewalLabel = 'Renovación confirmada';
    this.closeRenewModal();
  }

  openDeleteModal(contract: ContractedService): void {
    this.selectedContract = contract;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedContract = null;
  }

  confirmDelete(): void {
    if (!this.selectedContract) return;
    this.contracts = this.contracts.filter((contract) => contract.id !== this.selectedContract?.id);
    this.appState.setContractedServicesCount(this.contracts.length);
    this.closeDeleteModal();
  }

  private parseDate(value: string): Date {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));

    const localizedDate = value.match(/^(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})$/i);
    if (localizedDate) {
      const months: Record<string, number> = {
        ene: 0, enero: 0, feb: 1, febrero: 1, mar: 2, marzo: 2, abr: 3, abril: 3,
        may: 4, mayo: 4, jun: 5, junio: 5, jul: 6, julio: 6, ago: 7, agosto: 7,
        sep: 8, sept: 8, septiembre: 8, oct: 9, octubre: 9, nov: 10, noviembre: 10,
        dic: 11, diciembre: 11,
      };
      const month = months[localizedDate[2].toLowerCase()];
      if (month !== undefined) return new Date(Number(localizedDate[3]), month, Number(localizedDate[1]));
    }

    const normalizedValue = value
      .toLowerCase()
      .replace('ene', 'jan')
      .replace('feb', 'feb')
      .replace('mar', 'mar')
      .replace('abr', 'apr')
      .replace('may', 'may')
      .replace('jun', 'jun')
      .replace('jul', 'jul')
      .replace('ago', 'aug')
      .replace('sept', 'sep')
      .replace('oct', 'oct')
      .replace('nov', 'nov')
      .replace('dic', 'dec');
    const parsed = new Date(normalizedValue);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatDisplayDate(value: string): string {
    return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }).format(this.parseDate(value));
  }

  // Acciones de Servicio Reactivo
  toggleStatus(contract: ContractedService): void {
    // Encontrar el contrato correspondiente en el servicio
    const serviceContract = this.contractedServicesService.getContractById(contract.id);
    if (serviceContract) {
      this.contractedServicesService.toggleContractStatus(contract.id);
    } else {
      // Fallback: cambiar estado localmente
      contract.status = contract.status === 'Activo' ? 'Inactivo' : 'Activo';
    }
  }

  renew(contract: ContractedService): void {
    // Encontrar el contrato correspondiente en el servicio
    const serviceContract = this.contractedServicesService.getContractById(contract.id);
    if (serviceContract) {
      this.contractedServicesService.renewContract(contract.id);
    } else {
      // Fallback: renovar localmente
      this.openRenewModal(contract);
    }
  }

  deleteContract(id: string): void {
    if (confirm('¿Desea eliminar esta contratación?')) {
      this.contractedServicesService.deleteContract(id);
      this.contracts = this.contracts.filter(c => c.id !== id);
      this.appState.setContractedServicesCount(this.contracts.length);
    }
  }
}
