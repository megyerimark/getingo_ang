import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  BuddyRoomKey,
  CompanionActionEvent,
  CompanionActionKey,
  CompanionRoom,
  CompanionSkin,
  CompanionState,
  CompanionVisualAction
} from '../../core/models/companion.model';
import { Auth } from '../../services/auth';
import { CompanionService } from '../../services/companion';
import { ToastService } from '../../services/toast';
import { Buddy3D } from '../../shared/buddy-3d/buddy-3d';
import { MascotStage } from '../../shared/mascot-stage/mascot-stage';

@Component({
  selector: 'app-buddy',
  imports: [RouterLink, MascotStage, Buddy3D],
  templateUrl: './buddy.html',
  styleUrl: './buddy.scss'
})
export class Buddy implements OnInit {
  state: CompanionState | null = null;
  loading = true;
  action: CompanionActionKey | null = null;
  error = '';
  viewMode: 'mascot' | '3d' = 'mascot';
  actionEvent: CompanionActionEvent | null = null;
  private actionEventId = 0;

  constructor(
    public auth: Auth,
    private companionService: CompanionService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get room(): BuddyRoomKey {
    return this.state?.companion.selected_room ?? 'studio';
  }

  get premium(): boolean {
    return this.auth.currentUser()?.is_premium === true;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.companionService.getState().pipe(finalize(() => this.loading = false)).subscribe({
      next: state => this.state = state,
      error: () => this.error = 'A Buddy világa most nem tölthető be.'
    });
  }

  care(action: CompanionActionKey): void {
    if (this.action) return;
    this.action = action;
    this.error = '';

    this.companionService.performAction(action).pipe(finalize(() => this.action = null)).subscribe({
      next: response => {
        this.state = response.state;
        this.emitAction(action);
        this.toast.success(response.message);
      },
      error: err => this.toast.error(
        err?.error?.errors?.action?.[0] ?? err?.error?.message ?? 'A művelet nem sikerült.'
      )
    });
  }

  selectRoom(room: CompanionRoom): void {
    if (!this.state || room.key === this.room) return;
    if (!room.unlocked) {
      this.toast.info('Ez a Buddy szoba Premium előfizetéssel érhető el.');
      return;
    }

    this.companionService.updatePreferences({ room: room.key }).subscribe({
      next: state => this.state = state,
      error: err => this.toast.error(err?.error?.errors?.room?.[0] ?? 'A szoba mentése nem sikerült.')
    });
  }

  selectSkin(skin: CompanionSkin): void {
    if (!this.state) return;
    if (!skin.unlocked) {
      this.toast.info(`${skin.name} Premium Buddy.`);
      return;
    }
    if (skin.key === this.state.companion.selected_skin) return;

    this.companionService.updatePreferences({ skin: skin.key }).subscribe({
      next: state => {
        this.state = state;
        this.emitAction('pet');
        this.toast.success(`${skin.name} lett az új társad.`);
      },
      error: err => this.toast.error(err?.error?.errors?.skin?.[0] ?? 'A Buddy nem választható.')
    });
  }

  roomIcon(room: BuddyRoomKey): string {
    if (room === 'play') return 'bi-controller';
    if (room === 'night') return 'bi-moon-stars';
    if (room === 'aurora') return 'bi-stars';
    if (room === 'cyber') return 'bi-cpu';
    return 'bi-code-square';
  }

  pet(): void {
    this.emitAction('pet');
    this.toast.info('Pixel élvezi a simogatást.');
  }

  rest(): void {
    this.emitAction('rest');
    this.toast.info('Pixel lepihen egy kicsit.');
  }

  actionCost(action: CompanionActionKey): number {
    return this.state?.actions.find(item => item.key === action)?.cost ?? 0;
  }

  tip(): string {
    if (!this.state) return '';
    const companion = this.state.companion;
    const minimum = Math.min(companion.water, companion.hunger, companion.happiness);
    if (minimum === companion.water) return 'Pixel megszomjazott.';
    if (minimum === companion.hunger) return 'Pixel enne valamit.';
    return 'Pixel játszana veled.';
  }

  private emitAction(type: CompanionVisualAction): void {
    this.actionEvent = { id: ++this.actionEventId, type };
  }
}
