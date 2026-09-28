import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchService, SearchResult } from '../../services/search';

@Component({
  selector: 'app-search',
  imports: [ReactiveFormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit {
  query = new FormControl('', { nonNullable: true });
  results: SearchResult['results'] | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap.get('q') ?? '';

    if (query) {
      this.query.setValue(query);
      this.runSearch(query);
    }
  }

  submit(): void {
    const query = this.query.value.trim();

    if (query.length < 2) {
      this.errorMessage = 'Legalább 2 karaktert adj meg.';
      return;
    }

    this.router.navigate([], {
      queryParams: { q: query },
      queryParamsHandling: 'merge'
    });

    this.runSearch(query);
  }

  private runSearch(query: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.searchService.search(query).subscribe({
      next: response => {
        this.results = response.results;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.status === 429
          ? 'Túl sok keresés. Próbáld újra később.'
          : 'Nem sikerült a keresés.';
        this.loading = false;
      }
    });
  }
}