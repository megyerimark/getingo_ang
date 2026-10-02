import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { AdminExercise } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-admin-exercises',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-exercises.html'
})
export class AdminExercises implements OnInit {
  exercises: AdminExercise[] = [];
  categories: Category[] = [];
  editing: AdminExercise | null = null;

  form = new FormGroup({
    category_id: new FormControl<number | null>(null, Validators.required),
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.required }),
    difficulty: new FormControl('kezdő', { nonNullable: true }),
    solution: new FormControl('', { nonNullable: true })
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
    this.adminService.getCategories().subscribe({
      next: categories => this.categories = categories,
      error: () => this.toast.error('Nem sikerült betölteni a kategóriákat.')
    });
  }

  load(): void {
    this.adminService.getExercises().subscribe({
      next: exercises => this.exercises = exercises,
      error: () => this.toast.error('Nem sikerült betölteni a feladatokat.')
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();
    if (!data.category_id) return;

    const request = this.editing
      ? this.adminService.updateExercise(this.editing.id, data as any)
      : this.adminService.createExercise(data as any);

    request.subscribe({
      next: response => {
        this.toast.success(response.message ?? 'Feladat elmentve.');
        this.reset();
        this.load();
      },
      error: error => this.toast.error(this.firstError(error, 'Nem sikerült menteni a feladatot.'))
    });
  }

  edit(exercise: AdminExercise): void {
    this.editing = exercise;
    this.form.setValue({
      category_id: exercise.category_id,
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      solution: exercise.solution ?? ''
    });
  }

  remove(id: number): void {
    if (!confirm('Biztosan törlöd?')) return;
    this.adminService.deleteExercise(id).subscribe({
      next: response => {
        this.toast.success(response.message ?? 'Feladat törölve.');
        this.load();
      },
      error: error => this.toast.error(this.firstError(error, 'Nem sikerült törölni a feladatot.'))
    });
  }

  reset(): void {
    this.editing = null;
    this.form.reset({ category_id: null, title: '', description: '', difficulty: 'kezdő', solution: '' });
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
