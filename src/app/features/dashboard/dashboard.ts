import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientsService, Client } from '../../core/services/clients.service';
import { ContractedServicesService, ContractedService } from '../../core/services/contracted-services.service';
import { AppStateService } from '../../core/services/app-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  LucideClock3,
  LucideDynamicIcon,
  LucideFileCheck2,
  LucideTrendingUp,
  LucideUsers,
  type LucideIcon,
} from '@lucide/angular';

interface KpiCard {
  label: string;
  value: string;
  helper: string;
  status?: string;
  kind: 'clients' | 'services' | 'mrr' | 'renewals';
  icon: LucideIcon;
  theme: 'blue' | 'purple' | 'emerald' | 'amber';
}

interface RenewalItem {
  name: string;
  service: string;
  period: string;
  amount: string;
  renewalDate: string;
  days: number;
}

interface CatalogItem {
  name: string;
  subtitle: string;
  price: string;
}

interface ContractForRenewal extends RenewalItem {
  id: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDynamicIcon],
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  isRenewModalOpen = false;
  selectedContractForRenewal: ContractForRenewal | null = null;
  newRenewalDate = '';

  // KPI Dynamic Properties
  totalClientsCount = 0;
  activeClientsCount = 0;
  totalContractedServices = 0;
  activeContractsCount = 0;
  mrrTotal = 0;
  upcomingRenewalsCount = 0;

  // Reactive data
  clients: Client[] = [];
  contracts: ContractedService[] = [];
  renewals: ContractForRenewal[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private clientsService: ClientsService,
    private contractsService: ContractedServicesService,
    private appState: AppStateService
  ) {}

  ngOnInit(): void {
    // Escuchar Clientes
    this.clientsService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe((clients) => {
        this.clients = clients;
        this.totalClientsCount = clients.length;
        this.activeClientsCount = clients.filter(c => c.status === 'Activo').length;
        this.updateAppState();
      });

    // Escuchar Contratos
    this.contractsService.contracts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((contracts) => {
        this.contracts = contracts;
        this.totalContractedServices = contracts.length;
        
        // Contratos vigentes/activos
        this.activeContractsCount = contracts.filter(c => c.status === 'Activo').length;

        // Calcular MRR ÚNICAMENTE de contratos con estado 'Activo'
        this.mrrTotal = contracts
          .filter(c => c.status === 'Activo')
          .reduce((sum, c) => sum + (Number(c.monthlyCost) || 0), 0);

        // Calcular Renovaciones pendientes a 30 días
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(today.getDate() + 30);

        this.upcomingRenewalsCount = contracts.filter(c => {
          if (!c.renewalDate || c.renewalDate === 'N/A') return false;
          const rDate = new Date(c.renewalDate);
          return rDate >= today && rDate <= in30Days;
        }).length;

        // Convert to RenewalItem format for display (solo contratos con renewalDate)
        this.renewals = contracts
          .filter(c => c.renewalDate && c.renewalDate !== 'N/A')
          .map(contract => this.convertToRenewalItem(contract));
        
        this.updateAppState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private convertToRenewalItem(contract: ContractedService): ContractForRenewal {
    const today = new Date();
    const renewalDate = new Date(contract.renewalDate || '');
    const timeDiff = renewalDate.getTime() - today.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      id: contract.id,
      name: contract.clientName,
      service: contract.serviceName,
      period: contract.period || 'Mensual',
      amount: `$${contract.monthlyCost.toFixed(2)}/mes`,
      renewalDate: this.formatDisplayDate(contract.renewalDate || ''),
      days: days
    };
  }

  private updateAppState(): void {
    this.appState.setClientsCount(this.totalClientsCount);
    this.appState.setContractedServicesCount(this.activeContractsCount);
  }

  private readonly kpiDefinitions: KpiCard[] = [
    {
      label: 'TOTAL CLIENTES',
      value: '0',
      status: '(0 activos)',
      helper: 'Empresas y personas registradas',
      kind: 'clients',
      icon: LucideUsers,
      theme: 'blue',
    },
    {
      label: 'SERVICIOS CONTRATADOS',
      value: '0',
      status: 'de 0 totales',
      helper: 'Contratos vigentes en el sistema',
      kind: 'services',
      icon: LucideFileCheck2,
      theme: 'purple',
    },
    {
      label: 'COBRO MENSUAL (MRR)',
      value: 'US$0.00',
      helper: 'Monto recurrente estimado',
      kind: 'mrr',
      icon: LucideTrendingUp,
      theme: 'emerald',
    },
    {
      label: 'RENOVACIONES 30 DIAS',
      value: '0',
      status: 'requieren atención',
      helper: 'Fechas de renovación próximas',
      kind: 'renewals',
      icon: LucideClock3,
      theme: 'amber',
    },
  ];

  get kpis(): KpiCard[] {
    return this.kpiDefinitions.map((kpi) => {
      if (kpi.kind === 'clients') 
        return { ...kpi, value: String(this.totalClientsCount), status: `(${this.activeClientsCount} activos)` };
      if (kpi.kind === 'services') 
        return { ...kpi, value: String(this.activeContractsCount), status: `de ${this.totalContractedServices} totales` };
      if (kpi.kind === 'mrr') 
        return { ...kpi, value: `US$${this.mrrTotal.toFixed(2)}` };
      if (kpi.kind === 'renewals') 
        return { ...kpi, value: String(this.upcomingRenewalsCount), status: 'requieren atención' };
      return kpi;
    });
  }

  catalog: CatalogItem[] = [
    { name: 'Mantenimiento Web Premium', subtitle: 'Desarrollo & Web', price: '$155.00' },
    { name: 'Licencia Software ERP Nube', subtitle: 'SaaS & Licencias', price: '$355.00' },
    { name: 'Hosting Dedicado & Cloud VPS', subtitle: 'Infraestructura', price: '$80.00' },
    { name: 'Soporte Técnico VIP In-Site', subtitle: 'Soporte', price: '$200.00' },
  ];

  goToNewContract(): void {
    this.router.navigate(['/contracted-services'], { queryParams: { action: 'new' } });
  }

  goToClientsDirectory(): void {
    this.router.navigate(['/clients']);
  }

  goToAllContractedServices(): void {
    this.router.navigate(['/contracted-services']);
  }

  goToCatalogManagement(): void {
    this.router.navigate(['/service-catalog']);
  }

  openRenewModal(contract: ContractForRenewal): void {
    this.selectedContractForRenewal = contract;
    this.newRenewalDate = this.toInputDate(contract.renewalDate);
    this.isRenewModalOpen = true;
  }

  closeRenewModal(): void {
    this.isRenewModalOpen = false;
    this.selectedContractForRenewal = null;
    this.newRenewalDate = '';
  }

  confirmRenewal(): void {
    if (!this.selectedContractForRenewal || !this.newRenewalDate) return;
    this.selectedContractForRenewal.renewalDate = this.formatDisplayDate(this.newRenewalDate);
    this.selectedContractForRenewal.days = 0;
    this.closeRenewModal();
  }

  private toInputDate(value: string): string {
    const months: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11 };
    const localized = value.toLowerCase().match(/^(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})$/);
    const parsed = localized && months[localized[2]] !== undefined
      ? new Date(Number(localized[3]), months[localized[2]], Number(localized[1]))
      : new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  }

  private formatDisplayDate(value: string): string {
    return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
  }
}
