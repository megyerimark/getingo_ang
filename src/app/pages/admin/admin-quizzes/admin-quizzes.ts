import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminLesson, AdminQuiz } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-admin-quizzes',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-quizzes.html',
  styleUrl: './admin-quizzes.scss'
})
export class AdminQuizzes implements OnInit {
  quizzes: AdminQuiz[] = [];
  lessons: AdminLesson[] = [];
  editingId: number | null = null;

  form = new FormGroup({
    lesson_id: new FormControl<number | null>(null, Validators.required),
    question: new FormControl('', { nonNullable: true, validators: Validators.required }),
    option_a: new FormControl('', { nonNullable: true, validators: Validators.required }),
    option_b: new FormControl('', { nonNullable: true, validators: Validators.required }),
    option_c: new FormControl('', { nonNullable: true, validators: Validators.required }),
    option_d: new FormControl('', { nonNullable: true, validators: Validators.required }),
    correct_answer: new FormControl<'a' | 'b' | 'c' | 'd'>('a', { nonNullable: true })
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
    this.adminService.getLessons().subscribe({
      next: lessons => this.lessons = lessons,
      error: () => this.toast.error('Nem sikerült betölteni a tananyagokat a kvízekhez.')
    });
  }

  load(): void {
    this.adminService.getQuizzes().subscribe({
      next: quizzes => this.quizzes = quizzes,
      error: () => this.toast.error('Nem sikerült betölteni a kvízeket.')
    });
  }

  edit(quiz: AdminQuiz): void {
    this.editingId = quiz.id;
    this.form.patchValue(quiz);
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset({
      lesson_id: null,
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a'
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const data = { ...value, lesson_id: Number(value.lesson_id) };
    const request = this.editingId
      ? this.adminService.updateQuiz(this.editingId, data)
      : this.adminService.createQuiz(data);

    request.subscribe({
      next: response => {
        this.toast.success(response.message ?? 'Kvízkérdés elmentve.');
        this.cancel();
        this.load();
      },
      error: error => this.toast.error(this.firstError(error, 'Nem sikerült menteni a kvízkérdést.'))
    });
  }

  delete(id: number): void {
    if (!confirm('Biztosan törlöd?')) return;

    this.adminService.deleteQuiz(id).subscribe({
      next: response => {
        this.toast.success(response.message ?? 'Kvízkérdés törölve.');
        this.load();
      },
      error: error => this.toast.error(this.firstError(error, 'Nem sikerült törölni a kvízkérdést.'))
    });
  }

  private firstError(error: any, fallback: string): string {
    const errors = error.error?.errors;
    if (errors) {
      const key = Object.keys(errors)[0];
      return errors[key]?.[0] ?? fallback;
    }
    return error.error?.message ?? fallback;
  }
}
