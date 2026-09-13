import { TestBed } from '@angular/core/testing';
import { UserThemeService } from './user-theme.service';

describe('UserThemeService', () => {
  let service: UserThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
