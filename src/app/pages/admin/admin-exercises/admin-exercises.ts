import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminExercise } from '../../../core/models/admin.model';
import { Category } from '../../../core/models/category.model';
import { AdminService } from '../../../services/admin';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-admin-exercises',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-exercises.html',
  styleUrl: './admin-exercises.scss'
})
export class AdminExercises implements OnInit {
  exercises: AdminExercise[] = [];
  categories: Category[] = [];
  editingId: number | null = null;

  form = new FormGroup({
    category_id: new FormControl<number | null>(null, Validators.required),
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.required }),
    difficulty: new FormControl('', { nonNullable: true, validators: Validators.required }),
    solution: new FormControl<string | null>(null)
  });

  constructor(private adminService: AdminService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
    this.categoryService.getAll().subscribe(categories => this.categories = categories);
  }

  load(): void {
    this.adminService.getExercises().subscribe(exercises => this.exercises = exercises);
  }

  edit(exercise: AdminExercise): void {
    this.editingId = exercise.id;
    this.form.patchValue(exercise);
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();

    const data = {
      category_id: Number(value.category_id),
      title: value.title,
      description: value.description,
      difficulty: value.difficulty,
      solution: value.solution || null
    };

    const request = this.editingId
      ? this.adminService.updateExercise(this.editingId, data)
      : this.adminService.createExercise(data);

    request.subscribe(() => {
      this.cancel();
      this.load();
    });
  }

  delete(id: number): void {
    if (!confirm('Biztosan törlöd?')) return;

    this.adminService.deleteExercise(id).subscribe(() => this.load());
  }
}