import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Project,
  ProjectCheckResponse,
  ProjectWorkspacePayload
} from '../../core/models/project.model';
import { ProjectService } from '../../services/project';

type EditorTab = 'html' | 'css' | 'javascript' | 'console';

interface RunnerMessage {
  source: 'getingo-project-runner';
  token: string;
  projectId: number;
  output: string[];
  done: boolean;
}

@Component({
  selector: 'app-project-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetail implements OnInit {
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  project: Project | null = null;
  loading = true;
  error = '';

  activeTab: EditorTab = 'javascript';
  htmlCode = '';
  cssCode = '';
  javascriptCode = '';
  consoleOutput: string[] = [];

  savedMessage = '';
  checkMessage = '';
  checkPassed: boolean | null = null;
  saving = false;
  running = false;
  checking = false;

  private pendingCheck = false;
  private runnerToken = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'Érvénytelen projektazonosító.';
      this.loading = false;
      return;
    }

    this.projectService.getById(id).subscribe({
      next: response => {
        this.project = response.project;
        const submission = response.submission;

        this.htmlCode = submission?.html_code ?? response.project.starter_html ?? '';
        this.cssCode = submission?.css_code ?? response.project.starter_css ?? '';
        this.javascriptCode = submission?.javascript_code ?? response.project.starter_javascript ?? '';

        if (this.javascriptCode.trim()) {
          this.activeTab = 'javascript';
        } else if (this.htmlCode.trim()) {
          this.activeTab = 'html';
        } else if (this.cssCode.trim()) {
          this.activeTab = 'css';
        }

        this.loading = false;
        setTimeout(() => this.runProject(), 0);
      },
      error: () => {
        this.error = 'A projekt nem található vagy most nem tölthető be.';
        this.loading = false;
      }
    });
  }

  setTab(tab: EditorTab): void {
    this.activeTab = tab;
  }

  saveWorkspace(): void {
    if (!this.project || this.saving) return;

    this.saving = true;
    this.savedMessage = '';

    this.projectService.saveWorkspace(this.project.id, this.workspacePayload()).subscribe({
      next: response => {
        this.savedMessage = response.message;
        this.saving = false;
      },
      error: () => {
        this.savedMessage = 'A mentés most nem sikerült. Próbáld újra.';
        this.saving = false;
      }
    });
  }

  runProject(checkAfterRun = false): void {
    if (!this.project || !this.previewFrame) return;

    this.runnerToken = this.createRunnerToken();
    this.pendingCheck = checkAfterRun;
    this.consoleOutput = [];
    this.checkMessage = checkAfterRun ? 'A megoldás futtatása és ellenőrzése...' : '';
    this.checkPassed = null;
    this.running = true;

    this.previewFrame.nativeElement.srcdoc = this.buildPreviewDocument(
      this.project.id,
      this.runnerToken
    );
  }

  checkProject(): void {
    if (!this.project || this.checking) return;

    if (!this.project.validation_configured) {
      this.checkPassed = false;
      this.checkMessage = 'Ehhez a projekthez az adminnak még be kell állítania az ellenőrzést.';
      return;
    }

    this.checking = true;
    this.runProject(true);
  }

  resetToStarter(): void {
    if (!this.project) return;
    if (!confirm('Visszaállítod a szerkesztőt az admin által megadott kezdőkódra?')) return;

    this.htmlCode = this.project.starter_html ?? '';
    this.cssCode = this.project.starter_css ?? '';
    this.javascriptCode = this.project.starter_javascript ?? '';
    this.consoleOutput = [];
    this.checkMessage = '';
    this.checkPassed = null;
    this.runProject();
  }

  @HostListener('window:message', ['$event'])
  onRunnerMessage(event: MessageEvent<unknown>): void {
    if (!this.project || !this.isRunnerMessage(event.data)) return;

    const message = event.data;
    if (message.token !== this.runnerToken || message.projectId !== this.project.id) return;

    this.consoleOutput = message.output;

    if (!message.done) return;

    this.running = false;

    if (this.pendingCheck) {
      this.pendingCheck = false;
      this.sendCheck();
    }
  }

  validationLabel(): string {
    return this.project?.validation_type === 'console_contains'
      ? 'Elvárt konzolsorok'
      : 'Pontos konzolkimenet';
  }

  private sendCheck(): void {
    if (!this.project) return;

    this.projectService.check(this.project.id, {
      ...this.workspacePayload(),
      console_output: this.consoleOutput
    }).subscribe({
      next: response => this.handleCheckResponse(response),
      error: error => {
        const validationMessage = error?.error?.errors?.project?.[0];
        this.checkPassed = false;
        this.checkMessage = validationMessage ?? error?.error?.message ?? 'Az ellenőrzés most nem sikerült.';
        this.checking = false;
      }
    });
  }

  private handleCheckResponse(response: ProjectCheckResponse): void {
    this.checkPassed = response.passed;
    this.checkMessage = response.message;
    this.checking = false;

    if (response.passed && this.project) {
      this.project.is_completed = true;
    }
  }

  private workspacePayload(): ProjectWorkspacePayload {
    return {
      html_code: this.htmlCode,
      css_code: this.cssCode,
      javascript_code: this.javascriptCode
    };
  }

  private buildPreviewDocument(projectId: number, token: string): string {
    const safeCss = this.cssCode.replace(/<\/style/gi, '<\\/style');
    const safeJs = this.javascriptCode.replace(/<\/script/gi, '<\\/script');
    const tokenJson = JSON.stringify(token);

    return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none';">
  <style>
    :root { color-scheme: light; }
    body { margin: 0; padding: 18px; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #ffffff; }
    ${safeCss}
  </style>
</head>
<body>
  ${this.htmlCode}
  <script>
    (() => {
      const output = [];
      const token = ${tokenJson};
      const formatValue = (value) => {
        if (typeof value === 'string') return value;
        try {
          const json = JSON.stringify(value);
          return json === undefined ? String(value) : json;
        } catch {
          return String(value);
        }
      };
      const send = (done = false) => {
        parent.postMessage({
          source: 'getingo-project-runner',
          token,
          projectId: ${projectId},
          output: [...output],
          done
        }, '*');
      };
      ['log', 'info', 'warn', 'error'].forEach((method) => {
        const original = console[method].bind(console);
        console[method] = (...args) => {
          output.push(args.map(formatValue).join(' '));
          original(...args);
          send(false);
        };
      });
      window.addEventListener('error', (event) => {
        output.push('HIBA: ' + event.message);
        send(false);
      });
      try {
        ${safeJs}
      } catch (error) {
        output.push('HIBA: ' + (error instanceof Error ? error.message : String(error)));
      }
      window.setTimeout(() => send(true), 180);
    })();
  <\/script>
</body>
</html>`;
  }

  private createRunnerToken(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private isRunnerMessage(value: unknown): value is RunnerMessage {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as Partial<RunnerMessage>;
    return candidate.source === 'getingo-project-runner'
      && typeof candidate.token === 'string'
      && typeof candidate.projectId === 'number'
      && Array.isArray(candidate.output)
      && candidate.output.every(item => typeof item === 'string')
      && typeof candidate.done === 'boolean';
  }
}
