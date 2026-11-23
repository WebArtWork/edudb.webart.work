import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { RankTableComponent } from '../../components/rank-table/rank-table.component';
import { TagLinksComponent, type TagLink } from '../../components/tag-links/tag-links.component';
import { apps, categories } from '../../feature/edudb/edudb.data';

@Component({
	imports: [RankTableComponent, RouterLink, TagLinksComponent, TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Leaderboard
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Ranking
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				Every app awards points. Points add up in the category of the app and in the overall
				ranking.
			</p>
			<p class="mt-3">
				<a
					class="font-semibold text-[var(--c-primary)] underline underline-offset-4"
					routerLink="/ranking-rules"
					translate
				>
					How we calculate the ranking
				</a>
			</p>
			<div class="mt-8">
				<app-rank-table
					[appSlugs]="allAppSlugs"
					[limit]="20"
					caption="Overall ranking, top 20"
				/>
			</div>

			<h2
				class="mb-3 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Rankings by category
			</h2>
			<app-tag-links [items]="categoryLinks" />

			<h2
				class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Rankings by app
			</h2>
			<app-tag-links [items]="appLinks" />
		</div>
	`,
})
export class RankingsComponent {
	protected readonly allAppSlugs = apps.map((app) => app.slug);
	protected readonly categoryLinks: TagLink[] = categories.map((category) => ({
		label: category.name,
		path: `/categories/${category.slug}`,
	}));
	protected readonly appLinks: TagLink[] = apps.map((app) => ({
		label: app.name,
		path: `/apps/${app.slug}`,
	}));
}
