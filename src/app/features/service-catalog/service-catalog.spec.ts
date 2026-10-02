import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceCatalogComponent } from './service-catalog';

describe('ServiceCatalogComponent', () => {
  let component: ServiceCatalogComponent;
  let fixture: ComponentFixture<ServiceCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCatalogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCatalogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
