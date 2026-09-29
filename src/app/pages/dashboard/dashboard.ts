import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { AccountService } from '../../services/account';
import { User } from '../../core/models/user.model';
import { Note, NoteService } from '../../services/note';
import {
  CompanionActionKey,
  CompanionState
} from '../../core/models/companion.model';
import { CompanionService } from '../../services/companion';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  user: User | null = null;
  notes: Note[] = [];
  companionState: CompanionState | null = null;
  isLoading = true;
  notesLoading = true;
  companionLoading = true;
  companionAction: CompanionActionKey | null = null;
  lastCompanionAction: CompanionActionKey | null = null;
  buddyAnimating = false;
  companionMessage = '';
  companionError = '';
  showDeletePanel = false;
  isDeleting = false;
  deleteError = '';

  deleteForm = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    confirm: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    })
  });

  constructor(
    private auth: Auth,
    private accountService: AccountService,
    private router: Router,
    private noteService: NoteService,
    private companionService: CompanionService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadNotes();
    this.loadCompanion();
  }

  loadUser(): void {
    this.auth.me().subscribe({
      next: user => {
        this.user = user;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadNotes(): void {
    this.noteService.getAll().subscribe({
      next: notes => {
        this.notes = notes;
        this.notesLoading = false;
      },
      error: () => {
        this.notesLoading = false;
      }
    });
  }

  loadCompanion(): void {
    this.companionLoading = true;
    this.companionService.getState().subscribe({
      next: state => {
        this.companionState = state;
        this.companionLoading = false;
      },
      error: () => {
        this.companionError = 'A Getingo Buddy most nem tölthető be.';
        this.companionLoading = false;
      }
    });
  }

  careForCompanion(action: CompanionActionKey): void {
    if (this.companionAction) return;

    this.companionAction = action;
    this.companionMessage = '';
    this.companionError = '';

    this.companionService.performAction(action).subscribe({
      next: response => {
        this.companionState = response.state;
        this.companionMessage = response.message;
        this.lastCompanionAction = action;
        this.companionAction = null;
        this.triggerBuddyAnimation();
      },
      error: err => {
        this.companionError =
          err?.error?.errors?.action?.[0] ??
          err?.error?.message ??
          'A művelet nem sikerült.';
        this.companionAction = null;
      }
    });
  }

  actionCost(action: CompanionActionKey): number {
    return this.companionState?.actions.find(item => item.key === action)?.cost ?? 0;
  }

  actionGrowth(action: CompanionActionKey): number {
    return this.companionState?.actions.find(item => item.key === action)?.growth ?? 0;
  }

  actionLabel(action: CompanionActionKey): string {
    return this.companionState?.actions.find(item => item.key === action)?.label ?? action;
  }

  actionIcon(action: CompanionActionKey | null): string {
    if (action === 'water') return '💧';
    if (action === 'feed') return '🐟';
    if (action === 'play') return '✨';
    return '';
  }

  buddyAsset(): string {
    if (this.companionState?.companion.selected_skin?.includes('dog')) {
      return '/buddy-dog.png';
    }

    return '/buddy-cat-3d.png';
  }

  buddyWidth(): number {
    const size = this.companionState?.growth.size_percentage ?? 70;
    return Math.round(180 * (size / 70));
  }

  moodEmoji(): string {
    switch (this.companionState?.mood.key) {
      case 'radiant':
        return '🌟';
      case 'happy':
        return '😸';
      case 'calm':
        return '🙂';
      default:
        return '😴';
    }
  }

  companionTip(): string {
    if (!this.companionState) {
      return 'Teljesíts egy leckét, hogy pontokat szerezz a buddy gondozásához.';
    }

    const { water, hunger, happiness } = this.companionState.companion;
    const minimum = Math.min(water, hunger, happiness);

    if (minimum === water) {
      return 'Pixel most egy kis itatásnak örülne a legjobban.';
    }

    if (minimum === hunger) {
      return 'Adj neki egy falatot, hogy újra lendületbe jöjjön.';
    }

    return 'Játssz vele egyet, hogy még vidámabb legyen.';
  }

  progressHint(): string {
    if (!this.companionState) {
      return 'Minden lecke és kvíz közelebb visz a következő szinthez.';
    }

    if (this.companionState.growth.level >= this.companionState.growth.max_level) {
      return 'Elérted a 100. szintet: Pixel a legmagasabb Getingo Buddy formájában van.';
    }

    return `Még ${this.companionState.growth.points_to_next_level} fejlődési pont kell a ${this.companionState.growth.level + 1}. szinthez.`;
  }

  deleteNote(note: Note): void {
    if (!confirm('Biztosan törlöd ezt a jegyzetet?')) return;

    this.noteService.delete(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(item => item.id !== note.id);
      }
    });
  }

  toggleDeletePanel(): void {
    this.showDeletePanel = !this.showDeletePanel;
    this.deleteError = '';

    if (!this.showDeletePanel) {
      this.deleteForm.reset({ password: '', confirm: false });
    }
  }

  deleteAccount(): void {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    this.deleteError = '';
    this.isDeleting = true;

    this.accountService.deleteAccount(this.deleteForm.controls.password.value)
      .pipe(finalize(() => this.isDeleting = false))
      .subscribe({
        next: () => {
          this.auth.clearAuth();
          this.router.navigate(['/']);
        },
        error: error => {
          const errors = error.error?.errors;
          if (errors) {
            const firstKey = Object.keys(errors)[0];
            this.deleteError = errors[firstKey]?.[0] ?? 'Nem sikerült törölni a fiókot.';
            return;
          }

          this.deleteError = error.error?.message ?? 'Nem sikerült törölni a fiókot.';
        }
      });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.auth.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }

  private triggerBuddyAnimation(): void {
    this.buddyAnimating = false;
    setTimeout(() => {
      this.buddyAnimating = true;
      setTimeout(() => {
        this.buddyAnimating = false;
      }, 900);
    });
  }
}
