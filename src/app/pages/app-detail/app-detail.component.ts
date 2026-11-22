import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { RankTableComponent } from '../../components/rank-table/rank-table.component';
import { TagLinksComponent, type TagLink } from '../../components/tag-links/tag-links.component';
import { categories } from '../../feature/edudb/edudb.data';
import { appPhoto } from '../../feature/edudb/edudb.media';
import { getApp, teachersOfApp } from '../../feature/edudb/edudb.queries';
import { TeachersService } from '../../feature/teachers/teachers.service';

@Component({
	imports: [
		NgOptimizedImage,
		RankTableComponent,
		RouterLink,
		TagLinksComponent,
		TranslateDirective,
	],
	template: `
		@if (app) {
			<article class="directory-page">
				<p class="mb-4 flex flex-wrap gap-x-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/apps" translate>Apps</a>
					<span aria-hidden="true">/</span>
					<span [translate]="app.name">{{ app.name }}</span>
				</p>
				<header class="detail-hero">
					<div>
						<p class="eyebrow" translate>Education app</p>
						<h1 class="mt-2 text-5xl leading-tight" [translate]="app.name">
							{{ app.name }}
						</h1>
						<p
							class="mt-3 text-lg text-[var(--c-text-muted)]"
							[translate]="app.tagline"
						>
							{{ app.tagline }}
						</p>
						<p class="mt-4 max-w-[65ch]" [translate]="app.desc">{{ app.desc }}</p>
						<a
							class="action-link theme-focus mt-5"
							[href]="app.url"
							rel="noopener"
							[translate]="'Open {{name}}'"
							[vars]="openVars()"
						>
							Open {{ app.name }}
						</a>
					</div>
					<div class="detail-photo">
						<img [ngSrc]="photo" width="576" height="384" alt="" priority />
					</div>
				</header>

				<dl class="my-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
					<div
						class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
					>
						<dt
							class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
							translate
						>
							Price
						</dt>
						<dd
							class="mt-1 font-semibold text-[var(--c-text-strong)]"
							[translate]="app.price"
						>
							{{ app.price }}
						</dd>
					</div>
					<div
						class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
					>
						<dt
							class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
							translate
						>
							Platforms
						</dt>
						<dd
							class="mt-1 font-semibold text-[var(--c-text-strong)]"
							[translate]="app.platforms"
						>
							{{ app.platforms }}
						</dd>
					</div>
				</dl>

				<h2
					class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					What you get
				</h2>
				<ul class="list-disc space-y-1.5 pl-5 text-[var(--c-text)]">
					@for (feature of app.features; track feature) {
						<li [translate]="feature">{{ feature }}</li>
					}
				</ul>

				<h2
					class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Ranking
				</h2>
				<app-rank-table
					[appSlugs]="[app.slug]"
					[caption]="captionKey"
					[captionName]="app.name"
				/>
				<p class="mt-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/rankings" translate>
						See the overall ranking
					</a>
				</p>
				<p class="mt-1 text-sm text-[var(--c-text-muted)]" translate>
					Points from this app count toward the ranking of its category.
				</p>

				<h2
					class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Category
				</h2>
				<app-tag-links [items]="categoryLinks" />

				<h2
					class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Recommended by
				</h2>
				@if (teacherLinks().length) {
					<app-tag-links [items]="teacherLinks()" />
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>
						No teacher recommends this app yet.
					</p>
				}
			</article>
		}
	`,
})
export class AppDetailComponent {
	private readonly _translateService = inject(TranslateService);

	protected readonly app = getApp(inject(ActivatedRoute).snapshot.data['slug']);
	protected readonly photo = this.app ? appPhoto(this.app.slug) : '';
	protected readonly captionKey = '{{name}} ranking, top 10';
	protected readonly openVars = computed(() => ({
		name: this._translateService.translate(this.app?.name ?? '')(),
	}));
	protected readonly categoryLinks: TagLink[] = categories
		.filter((category) => this.app?.categories.includes(category.slug))
		.map((category) => ({ label: category.name, path: `/categories/${category.slug}` }));
	private readonly _teachers = inject(TeachersService);
	protected readonly teacherLinks = computed<TagLink[]>(() =>
		(this.app ? teachersOfApp(this._teachers.teachers(), this.app) : []).map((teacher) => ({
			label: teacher.name,
			path: '/teachers',
			fragment: teacher.slug,
		})),
	);
}
