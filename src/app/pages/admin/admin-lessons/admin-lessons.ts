import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminLesson } from '../../../core/models/admin.model';
import { Category } from '../../../core/models/category.model';
import { AdminService } from '../../../services/admin';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-admin-lessons',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-lessons.html',
  styleUrl: './admin-lessons.scss'
})
export class AdminLessons implements OnInit {
  lessons: AdminLesson[] = [];
  categories: Category[] = [];
  editingId: number | null = null;
  message = '';
  errorMessage = '';

  form = new FormGroup({
    category_id: new FormControl<number | null>(null, Validators.required),
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    slug: new FormControl('', { nonNullable: true, validators: Validators.required }),
    content: new FormControl('', { nonNullable: true, validators: Validators.required }),
    example_code: new FormControl('', { nonNullable: true })
  });

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.load();
    this.categoryService.getAll().subscribe(categories => this.categories = categories);
  }

  load(): void {
    this.adminService.getLessons().subscribe({
      next: lessons => this.lessons = lessons,
      error: () => this.errorMessage = 'Nem sikerült betölteni a leckéket.'
    });
  }

  edit(lesson: AdminLesson): void {
    this.editingId = lesson.id;
    this.form.patchValue({
      ...lesson,
      example_code: lesson.example_code ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const data = {
      category_id: Number(value.category_id),
      title: value.title,
      slug: value.slug,
      content: value.content,
      example_code: value.example_code || null
    };

    const request = this.editingId
      ? this.adminService.updateLesson(this.editingId, data)
      : this.adminService.createLesson(data);

    request.subscribe({
      next: () => {
        this.message = this.editingId ? 'Lecke módosítva.' : 'Lecke létrehozva.';
        this.cancel();
        this.load();
      },
      error: error => this.errorMessage = error.error?.message ?? 'Hiba történt.'
    });
  }

  delete(id: number): void {
    if (!confirm('Biztosan törlöd ezt a leckét?')) return;

    this.adminService.deleteLesson(id).subscribe({
      next: () => {
        this.message = 'Lecke törölve.';
        this.load();
      },
      error: () => this.errorMessage = 'Nem sikerült törölni.'
    });
  }
}