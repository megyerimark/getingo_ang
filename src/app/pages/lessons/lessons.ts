import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Lesson } from '../../core/models/lesson.model';
import { LessonService } from '../../services/lesson';
import { Note, NoteService } from '../../services/note';
import { FavoriteService } from '../../services/favorite';
import { ProgressService } from '../../services/progress';
import { PersonalCodeService } from '../../services/personal-code';
import { Auth } from '../../services/auth';
import { CodeRunner } from '../../shared/code-runner/code-runner';
import { LessonQuiz } from '../../shared/lesson-quiz/lesson-quiz';

@Component({
  selector: 'app-lessons',
  imports: [ReactiveFormsModule, RouterLink, CodeRunner,LessonQuiz],
  templateUrl: './lessons.html',
  styleUrl: './lessons.scss'
})
export class Lessons implements OnInit {
  lessons: Lesson[] = [];
  notes: Note[] = [];
  activeLesson: Lesson | null = null;
  activeNote: Note | null = null;
  loading = true;
  codeLoading = false;
  personalCodeSaved = false;
  message = '';
  errorMessage = '';

  note = new FormControl('', { nonNullable: true });
  workspaceCode = new FormControl('', { nonNullable: true });

  constructor(
    private route: ActivatedRoute,
    private lessonService: LessonService,
    private noteService: NoteService,
    private favoriteService: FavoriteService,
    private progressService: ProgressService,
    private personalCodeService: PersonalCodeService,
    public auth: Auth
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));

    if (!categoryId) {
      this.errorMessage = 'Hibás kategória.';
      this.loading = false;
      return;
    }

    this.lessonService.getByCategory(categoryId).subscribe({
      next: lessons => {
        this.lessons = lessons;
        const lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));

this.activeLesson = lessonId
  ? lessons.find(lesson => lesson.id === lessonId) ?? lessons[0] ?? null
  : lessons[0] ?? null;
        this.loading = false;

        if (this.auth.isLoggedIn()) {
          this.loadNotes();
          this.loadPersonalCode();
        } else {
          this.loadGuestCode();
        }
      },
      error: () => {
        this.errorMessage = 'Nem sikerült betölteni a tananyagokat.';
        this.loading = false;
      }
    });
  }

  selectLesson(lesson: Lesson): void {
    this.activeLesson = lesson;
    this.message = '';
    this.errorMessage = '';
    this.loadActiveNote();

    if (this.auth.isLoggedIn()) {
      this.loadPersonalCode();
    } else {
      this.loadGuestCode();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadGuestCode(): void {
    this.personalCodeSaved = false;
    this.workspaceCode.setValue(this.activeLesson?.example_code ?? '');
  }

  loadPersonalCode(): void {
    if (!this.activeLesson) return;

    this.codeLoading = true;

    this.personalCodeService.get(this.activeLesson.id).subscribe({
      next: response => {
        this.workspaceCode.setValue(response.code);
        this.personalCodeSaved = response.saved;
        this.codeLoading = false;
      },
      error: () => {
        this.workspaceCode.setValue(this.activeLesson?.example_code ?? '');
        this.codeLoading = false;
      }
    });
  }

  savePersonalCode(): void {
    if (!this.activeLesson) return;

    if (!this.auth.isLoggedIn()) {
      this.errorMessage = 'A saját kód mentéséhez be kell jelentkezned.';
      return;
    }

    this.personalCodeService.save(this.activeLesson.id, this.workspaceCode.value).subscribe({
      next: response => {
        this.personalCodeSaved = true;
        this.message = response.message ?? 'Saját kód elmentve.';
      },
      error: error => this.handleError(error)
    });
  }

  resetPersonalCode(): void {
    if (!this.activeLesson) return;

    if (!this.auth.isLoggedIn()) {
      this.workspaceCode.setValue(this.activeLesson.example_code ?? '');
      this.personalCodeSaved = false;
      return;
    }

    if (!confirm('Biztosan visszaállítod az eredeti kódot?')) return;

    this.personalCodeService.reset(this.activeLesson.id).subscribe({
      next: response => {
        this.workspaceCode.setValue(response.code);
        this.personalCodeSaved = false;
        this.message = response.message ?? 'Kód visszaállítva.';
      },
      error: error => this.handleError(error)
    });
  }

  loadNotes(): void {
    this.noteService.getAll().subscribe({
      next: notes => {
        this.notes = notes;
        this.loadActiveNote();
      }
    });
  }

  loadActiveNote(): void {
    if (!this.activeLesson) return;

    this.activeNote = this.notes.find(note => note.lesson_id === this.activeLesson!.id) ?? null;
    this.note.setValue(this.activeNote?.content ?? '');
  }

  saveNote(): void {
    if (!this.activeLesson || !this.note.value.trim()) return;

    this.noteService.save(this.activeLesson.id, this.note.value.trim()).subscribe({
      next: response => {
        this.message = response.message;

        const index = this.notes.findIndex(item => item.lesson_id === response.note.lesson_id);

        if (index >= 0) {
          this.notes[index] = response.note;
        } else {
          this.notes.push(response.note);
        }

        this.activeNote = response.note;
      },
      error: error => this.handleError(error)
    });
  }

  deleteNote(): void {
    if (!this.activeNote) return;
    if (!confirm('Biztosan törlöd a jegyzetet?')) return;

    const noteId = this.activeNote.id;

    this.noteService.delete(noteId).subscribe({
      next: response => {
        this.notes = this.notes.filter(item => item.id !== noteId);
        this.activeNote = null;
        this.note.setValue('');
        this.message = response.message;
      },
      error: error => this.handleError(error)
    });
  }

  toggleFavorite(): void {
    if (!this.activeLesson) return;

    this.favoriteService.toggle(this.activeLesson.id).subscribe({
      next: response => this.message = response.message ?? 'Kedvencek frissítve.',
      error: error => this.handleError(error)
    });
  }

  completeLesson(): void {
    if (!this.activeLesson) return;

    this.progressService.complete(this.activeLesson.id).subscribe({
      next: response => this.message = response.message ?? 'Lecke teljesítve.',
      error: error => this.handleError(error)
    });
  }

  private handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Ehhez a funkcióhoz be kell jelentkezned.';
      return;
    }

    this.errorMessage = error.error?.message ?? 'Hiba történt.';
  }
}