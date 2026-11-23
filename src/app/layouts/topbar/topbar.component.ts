import { NgOptimizedImage } from '@angular/common';
import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'app-topbar',
	imports: [NgOptimizedImage, RouterLink, RouterLinkActive, TranslateDirective],
	templateUrl: './topbar.component.html',
})
export class TopbarComponent {
	readonly skipRequested = output<void>();

	protected readonly navLinks = [
		{ label: 'Teachers', path: '/teachers' },
		{ label: 'Database', path: '/categories' },
		{ label: 'Apps', path: '/apps' },
		{ label: 'Schools', path: '/schools' },
		{ label: 'Ranking', path: '/rankings' },
	];
}
