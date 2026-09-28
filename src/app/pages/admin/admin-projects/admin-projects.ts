import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminProject } from '../../../core/models/admin.model';
import { AdminService } from '../../../services/admin';

@Component({
  selector: 'app-admin-projects',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss'
})
export class AdminProjects implements OnInit {
  projects: AdminProject[] = [];
  editingId: number | null = null;

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.required }),
    difficulty: new FormControl('', { nonNullable: true, validators: Validators.required }),
    estimated_time: new FormControl<number>(60, { nonNullable: true, validators: Validators.required }),
    solution: new FormControl('', { nonNullable: true })
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getProjects().subscribe(projects => this.projects = projects);
  }

  edit(project: AdminProject): void {
    this.editingId = project.id;
    this.form.patchValue({ ...project, solution: project.solution ?? '' });
  }

  cancel(): void {
    this.editingId = null;
    this.form.reset({ estimated_time: 60 });
  }

  save(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const data = { ...value, solution: value.solution || null };

    const request = this.editingId
      ? this.adminService.updateProject(this.editingId, data)
      : this.adminService.createProject(data);

    request.subscribe(() => {
      this.cancel();
      this.load();
    });
  }

  delete(id: number): void {
    if (!confirm('Biztosan törlöd?')) return;

    this.adminService.deleteProject(id).subscribe(() => this.load());
  }
}