import { Component, ElementRef, Input, ViewChild } from '@angular/core';

type RunnerMode = 'html' | 'css' | 'javascript';

@Component({
  selector: 'app-code-runner',
  imports: [],
  templateUrl: './code-runner.html',
  styleUrl: './code-runner.scss'
})
export class CodeRunner {
  @Input() code = '';
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  mode: RunnerMode = 'html';
  hasRun = false;

  setMode(mode: RunnerMode): void {
    this.mode = mode;
  }

  run(): void {
    if (!this.previewFrame) return;

    this.previewFrame.nativeElement.srcdoc = this.buildDocument();
    this.hasRun = true;
  }

  clear(): void {
    if (!this.previewFrame) return;

    this.previewFrame.nativeElement.srcdoc = '';
    this.hasRun = false;
  }

  private buildDocument(): string {
    if (this.mode === 'css') return this.buildCssDocument();
    if (this.mode === 'javascript') return this.buildJavaScriptDocument();
    return this.buildHtmlDocument();
  }

  private securityMeta(): string {
    return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none';">`;
  }

  private baseStyle(): string {
    return `
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          color: #212529;
          background: #fff;
        }
      </style>
    `;
  }
  private buildHtmlDocument(): string {
  const code = this.code.trim();

  if (/<!doctype|<html[\s>]/i.test(code)) {
    return code;
  }

  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      ${this.securityMeta()}
      ${this.baseStyle()}
    </head>
    <body>
      ${code}
    </body>
    </html>
  `;
}

  private buildCssDocument(): string {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          ${this.securityMeta()}
          ${this.baseStyle()}
          <style>${this.code}</style>
        </head>
        <body>
          <h1>CSS előnézet</h1>
          <p>Ez egy minta bekezdés.</p>
          <button>Gomb</button>
          <div class="box">Minta doboz</div>
        </body>
      </html>
    `;
  }

  private buildJavaScriptDocument(): string {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          ${this.securityMeta()}
          ${this.baseStyle()}
          <style>
            #console {
              margin-top: 20px;
              padding: 15px;
              min-height: 100px;
              background: #1e1e1e;
              color: #f8f8f2;
              border-radius: 6px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div id="app"></div>
          <pre id="console"></pre>

          <script>
            const output = document.getElementById('console');

            function formatValue(value) {
              if (typeof value === 'object') {
                try {
                  return JSON.stringify(value, null, 2);
                } catch {
                  return String(value);
                }
              }

              return String(value);
            }

            function write(type, values) {
              const line = values.map(formatValue).join(' ');
              output.textContent += (type ? type + ': ' : '') + line + '\\n';
            }

            const originalLog = console.log.bind(console);
            const originalError = console.error.bind(console);
            const originalWarn = console.warn.bind(console);

            console.log = (...values) => {
              write('', values);
              originalLog(...values);
            };

            console.error = (...values) => {
              write('Error', values);
              originalError(...values);
            };

            console.warn = (...values) => {
              write('Warning', values);
              originalWarn(...values);
            };

            window.addEventListener('error', event => {
              write('Error', [event.message]);
            });
          <\/script>

          <script>
            ${this.code}
          <\/script>
        </body>
      </html>
    `;
  }
}