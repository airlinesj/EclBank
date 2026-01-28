import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiAiService, ChatMessage } from '@core/services/gemini-ai.service';
import { Subject, interval, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss'
})
export class AiChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  messages$: Observable<ChatMessage[]>;
  userMessage: string = '';
  isLoading: boolean = false;
  showDownloadMenu: boolean = false;
  shouldScroll: boolean = false;
  elapsedSeconds: number = 0;
  loadingStartTime: number = 0;
  private destroy$ = new Subject<void>();

  suggestedQuestions = [
    'What are the current ECL market trends?',
    'Analyze current interest rates and predict future movements',
    'What are the stock market predictions for 2026?',
    'Provide a 12-month loss forecast for credit portfolios',
    'How do global economic indicators affect ECL?',
    'What is the expected default rate for 2026?'
  ];

  constructor(
    private geminiService: GeminiAiService,
    private sanitizer: DomSanitizer
  ) {
    this.messages$ = this.geminiService.chatHistory$;
  }

  ngOnInit(): void {
    this.messages$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.shouldScroll = true;
    });

    // Track elapsed time while loading
    interval(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isLoading && this.loadingStartTime > 0) {
          this.elapsedSeconds = Math.round((Date.now() - this.loadingStartTime) / 1000);
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      const element = this.chatMessagesRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch(err) {}
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;

    const message = this.userMessage.trim();
    console.log('[AI Chat Component] Sending message:', message);
    this.userMessage = '';
    this.isLoading = true;
    this.loadingStartTime = Date.now();
    this.elapsedSeconds = 0;

    this.geminiService
      .sendMessage(message)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.elapsedSeconds = 0;
          this.loadingStartTime = 0;
        })
      )
      .subscribe(
        (response) => {
          console.log('[AI Chat Component] Got response:', response);
          // Small delay to ensure state updates after message is added to history
          setTimeout(() => {
            this.shouldScroll = true;
          }, 100);
        },
        error => {
          console.error('[AI Chat Component] Error sending message:', error);
        }
      );
  }

  sendSuggestedQuestion(question: string): void {
    this.userMessage = question;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleDownloadMenu(): void {
    this.showDownloadMenu = !this.showDownloadMenu;
  }

  downloadAsJSON(): void {
    const blob = this.geminiService.downloadChatAsJSON();
    this.downloadBlob(blob, 'hilda-chat.json');
    this.showDownloadMenu = false;
  }

  downloadAsCSV(): void {
    const blob = this.geminiService.downloadChatAsCSV();
    this.downloadBlob(blob, 'hilda-chat.csv');
    this.showDownloadMenu = false;
  }

  downloadAsHTML(): void {
    const blob = this.geminiService.downloadChatAsHTML();
    this.downloadBlob(blob, 'hilda-chat.html');
    this.showDownloadMenu = false;
  }

  downloadAsPDF(): void {
    this.geminiService.downloadChatAsPDF();
    this.showDownloadMenu = false;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.geminiService.clearChatHistory();
    }
  }

  formatMessage(content: string): SafeHtml {
    const escaped = this.escapeHtml(content);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const withBreaks = withBold.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
