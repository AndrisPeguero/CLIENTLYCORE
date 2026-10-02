import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ContractedService {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  period: string;
  startDate: string;
  renewalDate?: string;
  monthlyCost: number;
  status: 'Activo' | 'Vencido' | 'Inactivo' | 'Pendiente' | 'Finalizado';
}

@Injectable({ providedIn: 'root' })
export class ContractedServicesService {
  private readonly STORAGE_KEY = 'cliently_contracts_data_v2';

  private initialContracts: ContractedService[] = [
    {
      id: '1',
      clientId: '1',
      clientName: 'Andris RD',
      serviceName: 'Licencia Software ERP Nube',
      period: 'Mensual',
      startDate: '2026-09-14',
      monthlyCost: 200,
      status: 'Activo'
    },
    {
      id: '2',
      clientId: '1',
      clientName: 'Andris RD',
      serviceName: 'Mantenimiento Web Premium',
      period: 'Mensual',
      startDate: '2026-08-10',
      renewalDate: '2026-09-09',
      monthlyCost: 150,
      status: 'Vencido'
    },
    {
      id: '3',
      clientId: '1',
      clientName: 'Andris RD',
      serviceName: 'Mantenimiento Web Premium',
      period: 'Pago Único',
      startDate: '2026-08-10',
      monthlyCost: 0,
      status: 'Activo'
    },
    {
      id: '4',
      clientId: '2',
      clientName: 'TechSolutions Dominicana SRL',
      serviceName: 'Licencia Software ERP Nube',
      period: 'Mensual',
      startDate: '2026-06-11',
      renewalDate: '2026-08-15',
      monthlyCost: 350,
      status: 'Vencido'
    },
    {
      id: '5',
      clientId: '2',
      clientName: 'TechSolutions Dominicana SRL',
      serviceName: 'Mantenimiento Web Premium',
      period: 'Anual',
      startDate: '2026-01-22',
      renewalDate: '2027-01-22',
      monthlyCost: 120,
      status: 'Activo'
    }
  ];

  private contractsSubject = new BehaviorSubject<ContractedService[]>(this.loadFromStorage());
  contracts$: Observable<ContractedService[]> = this.contractsSubject.asObservable();

  private loadFromStorage(): ContractedService[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando contratos', e);
      }
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialContracts));
    return this.initialContracts;
  }

  private saveToStorage(contracts: ContractedService[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
    this.contractsSubject.next(contracts);
  }

  getContracts(): ContractedService[] {
    return this.contractsSubject.getValue();
  }

  addContract(contract: ContractedService): void {
    this.saveToStorage([...this.getContracts(), contract]);
  }

  updateContract(updated: ContractedService): void {
    const current = this.getContracts();
    const index = current.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      this.saveToStorage([...current]);
    }
  }

  toggleContractStatus(id: string): void {
    const current = this.getContracts();
    const updated: ContractedService[] = current.map(c =>
      c.id === id ? { ...c, status: (c.status === 'Activo' ? 'Inactivo' : 'Activo') as ContractedService['status'] } : c
    );
    this.saveToStorage(updated);
  }

  renewContract(id: string): void {
    const current = this.getContracts();
    const updated = current.map(c => {
      if (c.id === id) {
        const baseDate = c.renewalDate ? new Date(c.renewalDate) : new Date();

        // Calcular extensión de tiempo según el periodo
        if (c.period === 'Mensual') {
          baseDate.setMonth(baseDate.getMonth() + 1);
        } else if (c.period === 'Anual') {
          baseDate.setFullYear(baseDate.getFullYear() + 1);
        } else {
          baseDate.setDate(baseDate.getDate() + 30);
        }

        return {
          ...c,
          renewalDate: baseDate.toISOString().split('T')[0],
          status: 'Activo' as const
        };
      }
      return c;
    });
    this.saveToStorage(updated);
  }

  deleteContract(id: string): void {
    this.saveToStorage(this.getContracts().filter(c => c.id !== id));
  }

  getContractById(id: string): ContractedService | undefined {
    return this.getContracts().find(c => c.id === id);
  }

  getContractsByClientId(clientId: string): ContractedService[] {
    return this.getContracts().filter(c => c.clientId === clientId);
  }

  getActiveContracts(): ContractedService[] {
    return this.getContracts().filter(c => c.status === 'Activo');
  }

  calculateMRR(): number {
    return this.getActiveContracts().reduce((sum, c) => sum + (Number(c.monthlyCost) || 0), 0);
  }

  getUpcomingRenewals(days: number = 30): ContractedService[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.getContracts().filter(c => {
      if (!c.renewalDate || c.renewalDate === 'N/A') return false;
      const renewalDate = new Date(c.renewalDate);
      return renewalDate >= today && renewalDate <= futureDate;
    });
  }
}
