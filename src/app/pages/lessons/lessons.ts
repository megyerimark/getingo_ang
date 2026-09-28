import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Lesson } from '../../core/models/lesson.model';
import { LessonService } from '../../services/lesson';
import { NoteService } from '../../services/note';
import { FavoriteService } from '../../services/favorite';
import { ProgressService } from '../../services/progress';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-lessons',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './lessons.html',
  styleUrl: './lessons.scss'
})
export class Lessons implements OnInit {
  lessons: Lesson[] = [];
  activeLesson: Lesson | null = null;
  loading = true;
  message = '';
  errorMessage = '';
  note = new FormControl('', { nonNullable: true });

  constructor(
    private route: ActivatedRoute,
    private lessonService: LessonService,
    private noteService: NoteService,
    private favoriteService: FavoriteService,
    private progressService: ProgressService,
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
        this.activeLesson = lessons[0] ?? null;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nem sikerült betölteni a leckéket.';
        this.loading = false;
      }
    });
  }

  selectLesson(lesson: Lesson): void {
    this.activeLesson = lesson;
    this.note.setValue('');
    this.message = '';
    this.errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveNote(): void {
    if (!this.activeLesson || !this.note.value.trim()) return;

    this.noteService.save(this.activeLesson.id, this.note.value.trim()).subscribe({
      next: () => this.message = 'Jegyzet elmentve.',
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
    } else if (error.status === 429) {
      this.errorMessage = 'Túl sok kérés. Próbáld újra később.';
    } else {
      this.errorMessage = error.error?.message ?? 'Hiba történt.';
    }
  }
}