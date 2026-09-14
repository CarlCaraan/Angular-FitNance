import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Workout } from './workout';

describe('Workout', () => {
  let component: Workout;
  let fixture: ComponentFixture<Workout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workout],
    }).compileComponents();

    fixture = TestBed.createComponent(Workout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
