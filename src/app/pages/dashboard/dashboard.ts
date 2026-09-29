import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../core/models/user.model';
import { Note, NoteService } from '../../services/note';
import {
  CompanionActionKey,
  CompanionState
} from '../../core/models/companion.model';
import { CompanionService } from '../../services/companion';

@Component({
  selector: 'app-dashboard',
  imports: [],
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
  companionMessage = '';
  companionError = '';

  constructor(
    private auth: Auth,
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
        this.companionAction = null;
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

  deleteNote(note: Note): void {
    if (!confirm('Biztosan törlöd ezt a jegyzetet?')) return;

    this.noteService.delete(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(item => item.id !== note.id);
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
}
