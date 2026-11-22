import { Component } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { AppCardComponent } from '../../components/app-card/app-card.component';
import { apps } from '../../feature/edudb/edudb.data';

@Component({
	imports: [AppCardComponent, TranslateDirective],
	template: `
		<div class="directory-page">
			<h1
				class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Education apps
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				Explore tools for chess practice, software design, physics revision and more.
			</p>
			<ul class="mt-8 catalog-grid">
				@for (app of apps; track app.slug) {
					<li><app-app-card [app]="app" /></li>
				}
			</ul>
		</div>
	`,
})
export class AppsComponent {
	protected readonly apps = apps;
}
