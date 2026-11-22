import { Component, computed, inject } from '@angular/core';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { ThemeService } from '@wawjs/ngx-ui';
import { environment } from '../../../environments/environment';

/** Theme and language, shown on the sign-in and profile pages. Only two languages, so they are plain labels. */
@Component({
	selector: 'app-preferences',
	imports: [TranslateDirective],
	template: `
		<section class="grid gap-5" aria-labelledby="preferences-title">
			<h2
				id="preferences-title"
				class="text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Preferences
			</h2>

			<div class="flex flex-wrap items-center gap-3">
				<span class="w-24 text-sm font-semibold text-[var(--c-text-muted)]" translate
					>Theme</span
				>
				<div class="flex gap-2" role="group" aria-label="Theme">
					@for (option of themes; track option.mode) {
						<button
							type="button"
							class="theme-interactive theme-focus inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold"
							[class]="
								mode() === option.mode
									? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[var(--c-on-primary)]'
									: 'border-[var(--c-border)] text-[var(--c-text-strong)] hover:border-[var(--c-primary)]'
							"
							[attr.aria-pressed]="mode() === option.mode"
							(click)="setMode(option.mode)"
						>
							<span class="material-symbols-outlined text-[18px]" aria-hidden="true">
								{{ option.icon }}
							</span>
							<span [translate]="option.label">{{ option.label }}</span>
						</button>
					}
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<span class="w-24 text-sm font-semibold text-[var(--c-text-muted)]" translate
					>Language</span
				>
				<div class="flex gap-2" role="group" aria-label="Language">
					@for (language of languages; track language.code) {
						<button
							type="button"
							class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold"
							[class]="
								active() === language.code
									? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[var(--c-on-primary)]'
									: 'border-[var(--c-border)] text-[var(--c-text-strong)] hover:border-[var(--c-primary)]'
							"
							[attr.aria-pressed]="active() === language.code"
							[attr.lang]="language.htmlLang"
							(click)="setLanguage(language.code)"
						>
							{{ language.nativeName }}
						</button>
					}
				</div>
			</div>
		</section>
	`,
})
export class PreferencesComponent {
	private readonly _themeService = inject(ThemeService);
	private readonly _translateService = inject(TranslateService);
	private readonly _languageService = inject(LanguageService);

	protected readonly themes = [
		{ mode: 'light', label: 'Light', icon: 'light_mode' },
		{ mode: 'dark', label: 'Dark', icon: 'dark_mode' },
	] as const;
	protected readonly languages = environment.languages;
	protected readonly mode = computed(() => this._themeService.mode() ?? 'light');
	protected readonly active = this._languageService.language;

	protected setMode(mode: 'light' | 'dark') {
		this._themeService.setMode(mode);
	}

	protected setLanguage(code: string) {
		return this._translateService.setLanguage(code);
	}
}
