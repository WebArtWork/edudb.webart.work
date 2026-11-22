import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { AppCardComponent } from '../../components/app-card/app-card.component';
import { RankTableComponent } from '../../components/rank-table/rank-table.component';
import { TeacherCardComponent } from '../../components/teacher-card/teacher-card.component';
import {
	appsOfCategory,
	categoryGroups,
	getCategory,
	teachersOfCategory,
} from '../../feature/edudb/edudb.queries';
import { subjectPhoto } from '../../feature/edudb/edudb.media';
import { TeachersService } from '../../feature/teachers/teachers.service';

@Component({
	imports: [
		AppCardComponent,
		RankTableComponent,
		NgOptimizedImage,
		RouterLink,
		TeacherCardComponent,
		TranslateDirective,
	],
	template: `
		@if (category) {
			<article class="directory-page">
				<p class="mb-4 flex flex-wrap gap-x-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/categories" translate
						>Categories</a
					>
					<span aria-hidden="true">/</span>
					<span [translate]="category.name">{{ category.name }}</span>
				</p>
				<header class="detail-hero">
					<div>
						<p
							class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
							[translate]="groupLabel"
						>
							{{ groupLabel }}
						</p>
						<h1
							class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
							[translate]="category.name"
						>
							{{ category.name }}
						</h1>
						<p
							class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]"
							[translate]="category.tagline"
						>
							{{ category.tagline }}
						</p>
						<p
							class="mt-4 max-w-[65ch] text-[var(--c-text)]"
							[translate]="category.desc"
						>
							{{ category.desc }}
						</p>
					</div>
					<div class="detail-photo">
						<img [ngSrc]="photo" width="576" height="384" alt="" priority />
					</div>
				</header>

				<h2
					class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Apps
				</h2>
				@if (apps.length) {
					<ul class="catalog-grid">
						@for (app of apps; track app.slug) {
							<li><app-app-card [app]="app" /></li>
						}
					</ul>
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>No apps here yet.</p>
				}

				<h2
					class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Ranking
				</h2>
				@if (apps.length > 1) {
					<p class="mb-3 text-[var(--c-text-muted)]" translate>
						Points from the apps above add up in this category.
					</p>
				}
				<app-rank-table
					[appSlugs]="appSlugs"
					[caption]="captionKey"
					[captionName]="category.name"
					[columns]="true"
				/>
				<p class="mt-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/rankings" translate>
						See the overall ranking
					</a>
				</p>

				<h2
					class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Teachers
				</h2>
				@if (teachers().length) {
					<ul class="catalog-grid">
						@for (teacher of teachers(); track teacher.slug) {
							<li><app-teacher-card [teacher]="teacher" /></li>
						}
					</ul>
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>No teachers here yet.</p>
				}
			</article>
		}
	`,
})
export class CategoryComponent {
	protected readonly category = getCategory(inject(ActivatedRoute).snapshot.data['slug']);
	protected readonly photo = this.category ? subjectPhoto(this.category.slug) : '';
	protected readonly apps = this.category ? appsOfCategory(this.category) : [];
	private readonly _teachers = inject(TeachersService);
	protected readonly teachers = computed(() => {
		const category = this.category;

		return category ? teachersOfCategory(this._teachers.teachers(), category) : [];
	});
	protected readonly appSlugs = this.apps.map((app) => app.slug);
	protected readonly captionKey = '{{name}} ranking, top 10';
	protected readonly groupLabel = this.category ? categoryGroups[this.category.group] : '';

	constructor() {
		void this._teachers.load();
	}
}
