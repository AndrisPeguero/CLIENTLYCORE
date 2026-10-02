import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CatalogServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly STORAGE_KEY = 'cliently_catalog_data_v2';

  private initialCatalog: CatalogServiceItem[] = [
    { id: '1', name: 'Mantenimiento Web Premium', category: 'Desarrollo & Web', price: 155.00 },
    { id: '2', name: 'Licencia Software ERP Nube', category: 'SaaS & Licencias', price: 350.00 },
    { id: '3', name: 'Hosting Dedicado & Cloud VPS', category: 'Infraestructura', price: 80.00 },
    { id: '4', name: 'Soporte Técnico VIP 24/7', category: 'Soporte', price: 50.00 }
  ];

  private catalogSubject = new BehaviorSubject<CatalogServiceItem[]>(this.loadFromStorage());
  catalog$: Observable<CatalogServiceItem[]> = this.catalogSubject.asObservable();

  private loadFromStorage(): CatalogServiceItem[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando catálogo', e);
      }
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialCatalog));
    return this.initialCatalog;
  }

  private saveToStorage(catalog: CatalogServiceItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(catalog));
    this.catalogSubject.next(catalog);
  }

  getCatalog(): CatalogServiceItem[] {
    return this.catalogSubject.getValue();
  }

  addService(item: CatalogServiceItem): void {
    this.saveToStorage([...this.getCatalog(), item]);
  }

  updateService(updated: CatalogServiceItem): void {
    const current = this.getCatalog();
    const index = current.findIndex(s => s.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      this.saveToStorage([...current]);
    }
  }

  deleteService(id: string): void {
    this.saveToStorage(this.getCatalog().filter(s => s.id !== id));
  }

  getServiceById(id: string): CatalogServiceItem | undefined {
    return this.getCatalog().find(s => s.id === id);
  }
}
