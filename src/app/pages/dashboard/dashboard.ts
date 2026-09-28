import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../core/models/user.model';
import { Note, NoteService } from '../../services/note';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  user: User | null = null;
  notes: Note[] = [];
  isLoading = true;
  notesLoading = true;

  constructor(
    private auth: Auth,
    private router: Router,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadNotes();
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