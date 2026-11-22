import { Component } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { categoriesByGroup, categoryGroups } from '../../feature/edudb/edudb.queries';

@Component({
	imports: [CategoryCardComponent, TranslateDirective],
	template: `
		<div class="directory-page">
			<h1
				class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Categories
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				Start with a school subject or a field of work, then see its apps and teachers.
			</p>
			@for (group of groups; track group.label) {
				<h2
					class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					[translate]="group.label"
				>
					{{ group.label }}
				</h2>
				<ul class="catalog-grid">
					@for (category of group.categories; track category.slug) {
						<li><app-category-card [category]="category" /></li>
					}
				</ul>
			}
		</div>
	`,
})
export class CategoriesComponent {
	protected readonly groups = (['school', 'work'] as const).map((key) => ({
		label: categoryGroups[key],
		categories: categoriesByGroup(key),
	}));
}
