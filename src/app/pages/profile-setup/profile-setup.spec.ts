import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileSetup } from './profile-setup';

describe('ProfileSetup', () => {
  let component: ProfileSetup;
  let fixture: ComponentFixture<ProfileSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
