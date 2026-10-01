import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../services/cookie-consent';

@Component({
  selector: 'app-cookie-consent',
  imports: [FormsModule, RouterLink],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss'
})
export class CookieConsent {
  analytics = false;
  marketing = false;

  constructor(public consent: CookieConsentService) {
    effect(() => {
      if (!this.consent.settingsOpen()) return;
      const current = this.consent.preferences();
      this.analytics = current?.analytics ?? false;
      this.marketing = current?.marketing ?? false;
    });
  }

  openSettings(): void {
    this.consent.openSettings();
  }

  save(): void {
    this.consent.saveCustom(this.analytics, this.marketing);
  }
}
