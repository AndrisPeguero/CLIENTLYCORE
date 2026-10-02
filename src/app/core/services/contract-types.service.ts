import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ContractType {
  id: string;
  name: string;
  durationDays: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ContractTypesService {
  private readonly STORAGE_KEY = 'cliently_contract_types_data_v2';

  private initialTypes: ContractType[] = [
    { id: '1', name: 'Mensual', durationDays: 30 },
    { id: '2', name: 'Anual', durationDays: 365 },
    { id: '3', name: 'Pago Único', durationDays: 0 }
  ];

  private typesSubject = new BehaviorSubject<ContractType[]>(this.loadFromStorage());
  types$: Observable<ContractType[]> = this.typesSubject.asObservable();

  private loadFromStorage(): ContractType[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando tipos de contrato', e);
      }
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialTypes));
    return this.initialTypes;
  }

  private saveToStorage(types: ContractType[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(types));
    this.typesSubject.next(types);
  }

  getTypes(): ContractType[] {
    return this.typesSubject.getValue();
  }

  addType(type: ContractType): void {
    this.saveToStorage([...this.getTypes(), type]);
  }

  updateType(updated: ContractType): void {
    const current = this.getTypes();
    const index = current.findIndex(t => t.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      this.saveToStorage([...current]);
    }
  }

  deleteType(id: string): void {
    this.saveToStorage(this.getTypes().filter(t => t.id !== id));
  }

  getTypeById(id: string): ContractType | undefined {
    return this.getTypes().find(t => t.id === id);
  }
}
