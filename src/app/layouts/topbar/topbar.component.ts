import { NgOptimizedImage } from '@angular/common';
import { Component, inject, model, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { ThemeService } from '@wawjs/ngx-ui';

@Component({
	selector: 'app-topbar',
	imports: [NgOptimizedImage, RouterLink, RouterLinkActive, TranslateDirective],
	templateUrl: './topbar.component.html',
})
export class TopbarComponent {
	readonly skipRequested = output<void>();
	readonly sidebarCollapsed = model(false);

	private readonly _theme = inject(ThemeService);
	private readonly _translate = inject(TranslateService);
	protected readonly mode = this._theme.mode;
	protected readonly language = inject(LanguageService).language;
	protected readonly navLinks = [
		{ label: 'Teachers', path: '/teachers', icon: 'person' },
		{ label: 'Database', path: '/categories', icon: 'category' },
		{ label: 'Apps', path: '/apps', icon: 'apps' },
		{ label: 'Schools', path: '/schools', icon: 'school' },
		{ label: 'Ranking', path: '/rankings', icon: 'leaderboard' },
	];

	protected toggleTheme() {
		this._theme.setMode(this.mode() === 'dark' ? 'light' : 'dark');
	}

	protected toggleLanguage() {
		return this._translate.setLanguage(this.language() === 'ua' ? 'en' : 'ua');
	}
}
