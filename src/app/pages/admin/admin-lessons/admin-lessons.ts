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
  editingLesson: AdminLesson | null = null;
  loading = true;
  saving = false;
  message = '';
  errorMessage = '';

  form = new FormGroup({
    category_id: new FormControl<number | null>(null, {
      validators: [Validators.required]
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    slug: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    example_html: new FormControl('', {
      nonNullable: true
    }),
    example_css: new FormControl('', {
      nonNullable: true
    }),
    example_javascript: new FormControl('', {
      nonNullable: true
    })
  });

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadLessons();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: categories => {
        this.categories = categories;
      },
      error: () => {
        this.errorMessage = 'Nem sikerült betölteni a kategóriákat.';
      }
    });
  }

  loadLessons(): void {
    this.loading = true;

    this.adminService.getLessons().subscribe({
      next: lessons => {
        this.lessons = lessons;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nem sikerült betölteni a leckéket.';
        this.loading = false;
      }
    });
  }

  titleChanged(): void {
    if (this.editingLesson) return;

    const slug = this.form.controls.title.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.form.controls.slug.setValue(slug);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const categoryId = this.form.controls.category_id.value;

    if (!categoryId) return;

    const data = {
      category_id: categoryId,
      title: this.form.controls.title.value,
      slug: this.form.controls.slug.value,
      content: this.form.controls.content.value,
      example_html: this.form.controls.example_html.value,
      example_css: this.form.controls.example_css.value,
      example_javascript: this.form.controls.example_javascript.value
    };

    this.saving = true;
    this.message = '';
    this.errorMessage = '';

    const request = this.editingLesson
      ? this.adminService.updateLesson(this.editingLesson.id, data)
      : this.adminService.createLesson(data);

    request.subscribe({
      next: response => {
        this.message = response.message ?? 'Tananyag elmentve.';
        this.saving = false;
        this.resetForm();
        this.loadLessons();
      },
      error: error => {
        this.errorMessage =
          error.error?.message ?? 'Nem sikerült menteni a tananyagot.';
        this.saving = false;
      }
    });
  }

  edit(lesson: AdminLesson): void {
    this.editingLesson = lesson;
    this.message = '';
    this.errorMessage = '';

    this.form.setValue({
      category_id: lesson.category_id,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      example_html: lesson.example_html ?? '',
      example_css: lesson.example_css ?? '',
      example_javascript:
        lesson.example_javascript ??
        lesson.example_code ??
        ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteLesson(lesson: AdminLesson): void {
    if (!confirm(`Biztosan törlöd ezt a leckét: ${lesson.title}?`)) {
      return;
    }

    this.adminService.deleteLesson(lesson.id).subscribe({
      next: response => {
        this.message = response.message ?? 'Lecke törölve.';

        this.lessons = this.lessons.filter(
          item => item.id !== lesson.id
        );

        if (this.editingLesson?.id === lesson.id) {
          this.resetForm();
        }
      },
      error: error => {
        this.errorMessage =
          error.error?.message ??
          'Nem sikerült törölni a leckét.';
      }
    });
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(
      category => category.id === categoryId
    )?.name ?? 'Ismeretlen kategória';
  }

  private resetForm(): void {
    this.editingLesson = null;

    this.form.reset({
      category_id: null,
      title: '',
      slug: '',
      content: '',
      example_html: '',
      example_css: '',
      example_javascript: ''
    });
  }
}