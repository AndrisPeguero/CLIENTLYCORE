import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  status: 'Activo' | 'Inactivo';
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly STORAGE_KEY = 'cliently_clients_data_v2';

  private initialClients: Client[] = [
    { id: '1', name: 'Andris RD', contactName: 'Andris Peguero', status: 'Activo' },
    { id: '2', name: 'TechSolutions Dominicana SRL', contactName: 'Carlos Mendoza', status: 'Activo' },
    { id: '3', name: 'Inversiones Rivas & Asociados', contactName: 'María Alejandra Rivas', status: 'Inactivo' }
  ];

  private clientsSubject = new BehaviorSubject<Client[]>(this.loadFromStorage());
  clients$: Observable<Client[]> = this.clientsSubject.asObservable();

  private loadFromStorage(): Client[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando clientes', e);
      }
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialClients));
    return this.initialClients;
  }

  private saveToStorage(clients: Client[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
    this.clientsSubject.next(clients);
  }

  getClients(): Client[] {
    return this.clientsSubject.getValue();
  }

  addClient(client: Client): void {
    this.saveToStorage([...this.getClients(), client]);
  }

  updateClient(updated: Client): void {
    const current = this.getClients();
    const newClients = current.map(c => c.id === updated.id ? { ...updated } : { ...c });
    this.saveToStorage(newClients);
  }

  toggleClientStatus(id: string): void {
    const current = this.getClients();
    const updated: Client[] = current.map(c =>
      c.id === id ? { ...c, status: (c.status === 'Activo' ? 'Inactivo' : 'Activo') as Client['status'] } : c
    );
    this.saveToStorage(updated);
  }

  deleteClient(id: string): void {
    this.saveToStorage(this.getClients().filter(c => c.id !== id));
  }

  getClientById(id: string): Client | undefined {
    return this.getClients().find(c => c.id === id);
  }
}
