import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // ==========================================
  // GLOBAL LOADING STATE
  // ==========================================

  private readonly _isLoading = signal(false);

  // Read-only signal para sa components
  readonly isLoading = this._isLoading.asReadonly();

  // ==========================================
  // START LOADING
  // ==========================================

  start(): void {
    this._isLoading.set(true);
  }

  // ==========================================
  // STOP LOADING
  // ==========================================

  stop(): void {
    this._isLoading.set(false);
  }
}
