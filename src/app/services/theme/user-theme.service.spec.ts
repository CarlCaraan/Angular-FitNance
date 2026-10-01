import { TestBed } from '@angular/core/testing';
import { ThemeService } from './user-theme.service';

describe('UserThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
