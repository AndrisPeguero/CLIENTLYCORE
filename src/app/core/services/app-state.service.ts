import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly clientsCountSubject = new BehaviorSubject(3);
  private readonly contractedServicesCountSubject = new BehaviorSubject(4);

  readonly clientsCount$ = this.clientsCountSubject.asObservable();
  readonly contractedServicesCount$ = this.contractedServicesCountSubject.asObservable();

  setClientsCount(count: number): void {
    this.clientsCountSubject.next(count);
  }

  setContractedServicesCount(count: number): void {
    this.contractedServicesCountSubject.next(count);
  }
}
