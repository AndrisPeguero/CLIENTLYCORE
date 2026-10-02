import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContractedServicesComponent } from './contracted-services';

describe('ContractedServicesComponent', () => {
  let component: ContractedServicesComponent;
  let fixture: ComponentFixture<ContractedServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractedServicesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractedServicesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
