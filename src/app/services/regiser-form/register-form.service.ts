import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RegisterFormService {
  private _state: any;
  private _tab: 'terms' | 'privacy' = 'terms';

  setFormState(state: any): void {
    this._state = state;
  }

  getFormState(): any {
    return this._state;
  }

  setTab(tab: 'terms' | 'privacy'): void {
    this._tab = tab;
  }

  getTab(): 'terms' | 'privacy' {
    return this._tab;
  }
}
