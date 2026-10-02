import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractTypesComponent } from './contract-types';

describe('ContractTypesComponent', () => {
  let component: ContractTypesComponent;
  let fixture: ComponentFixture<ContractTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractTypesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractTypesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
