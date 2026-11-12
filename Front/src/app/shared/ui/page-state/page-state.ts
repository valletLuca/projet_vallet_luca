import { Component, Input } from '@angular/core';

export type PageStateKind = 'empty' | 'search' | 'error';

@Component({
  selector: 'app-page-state',
  templateUrl: './page-state.html',
  styleUrl: './page-state.scss',
})
export class PageState {
  @Input() kind: PageStateKind = 'empty';
  @Input({ required: true }) heading!: string;
  @Input() message = '';
}
