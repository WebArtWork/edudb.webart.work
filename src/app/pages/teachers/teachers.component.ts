import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { TagLinksComponent, type TagLink } from '../../components/tag-links/tag-links.component';
import { TeacherCardComponent } from '../../components/teacher-card/teacher-card.component';
import { apps, categories } from '../../feature/edudb/edudb.data';
import { hueOf, initials } from '../../feature/edudb/edudb.queries';
import { TeachersService } from '../../feature/teachers/teachers.service';

/** `/teachers` is the list; `/teachers#<slug>` is one teacher (teachers are Firestore documents). */
@Component({
	imports: [RouterLink, TagLinksComponent, TeacherCardComponent, TranslateDirective],
	template: `
		<div class="directory-page">
			@if (slug()) {
				<p class="mb-4 flex flex-wrap gap-x-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/teachers" translate>Teachers</a>
					@if (teacher(); as teacher) {
						<span aria-hidden="true">/</span>
						<span>{{ teacher.name }}</span>
					}
				</p>

				@if (teacher(); as teacher) {
					<article>
						<div class="mb-6 flex flex-wrap items-center gap-5">
							@if (photo(); as photo) {
								<img
									class="h-22 w-22 flex-none rounded-full"
									[src]="photo"
									alt=""
									width="88"
									height="88"
									referrerpolicy="no-referrer"
								/>
							} @else {
								<span
									class="grid h-22 w-22 flex-none place-items-center rounded-full text-3xl font-bold text-white"
									[style.background]="'hsl(' + hue() + ' 55% 38%)'"
									aria-hidden="true"
								>
									{{ initial() }}
								</span>
							}
							<div>
								@if (teacher.subject) {
									<p
										class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
									>
										{{ teacher.subject }}
									</p>
								}
								<h1
									class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)]"
								>
									{{ teacher.name }}
								</h1>
								<p class="text-[var(--c-text-muted)]">{{ teacher.role }}</p>
							</div>
						</div>
						@if (teacher.short) {
							<p class="max-w-[60ch] text-xl text-[var(--c-text-muted)]">
								{{ teacher.short }}
							</p>
						}
						@if (teacher.bio) {
							<p class="mt-4 max-w-[65ch] text-[var(--c-text)]">{{ teacher.bio }}</p>
						}
						@if (teacher.topics.length) {
							<h2
								class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
								translate
							>
								Topics
							</h2>
							<ul class="flex flex-wrap gap-2">
								@for (topic of teacher.topics; track topic) {
									<li
										class="rounded-full bg-[var(--c-bg-tertiary)] px-3 py-1 text-sm font-semibold text-[var(--c-text-strong)]"
									>
										{{ topic }}
									</li>
								}
							</ul>
						}
						@if (categoryLinks().length) {
							<h2
								class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
								translate
							>
								Categories
							</h2>
							<app-tag-links [items]="categoryLinks()" />
						}
						@if (appLinks().length) {
							<h2
								class="page-section-title mb-3 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
								translate
							>
								Apps they recommend
							</h2>
							<app-tag-links [items]="appLinks()" />
						}
					</article>
				} @else if (teachers.loaded()) {
					<h1 class="text-3xl font-bold text-[var(--c-text-strong)]" translate>
						Teacher not found
					</h1>
					<p class="mt-3 text-[var(--c-text-muted)]">
						<a class="theme-focus underline" routerLink="/teachers" translate
							>See all teachers</a
						>
					</p>
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
				}
			} @else {
				<h1
					class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
					translate
				>
					Teachers
				</h1>
				<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
					Teachers, mentors and coaches for school subjects and for work.
				</p>
				@if (teachers.teachers().length) {
					<ul class="mt-8 catalog-grid">
						@for (item of teachers.teachers(); track item.slug) {
							<li><app-teacher-card [teacher]="item" /></li>
						}
					</ul>
				} @else if (teachers.failed()) {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>
						Could not load the list. Try again later.
					</p>
				} @else if (teachers.loaded()) {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>No teachers yet.</p>
				} @else {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>Loading...</p>
				}
			}
		</div>
	`,
})
export class TeachersComponent {
	protected readonly teachers = inject(TeachersService);
	protected readonly slug = toSignal(inject(ActivatedRoute).fragment, { initialValue: null });

	protected readonly teacher = computed(() => {
		const slug = this.slug();

		return slug ? this.teachers.teachers().find((item) => item.slug === slug) : undefined;
	});
	protected readonly photo = computed(() => {
		const url = this.teacher()?.photoUrl ?? '';

		return url.startsWith('https://') ? url : '';
	});
	protected readonly hue = computed(() => hueOf(this.teacher()?.slug ?? ''));
	protected readonly initial = computed(() => initials(this.teacher()?.name ?? ''));
	protected readonly categoryLinks = computed<TagLink[]>(() =>
		categories
			.filter((category) => this.teacher()?.categories.includes(category.slug))
			.map((category) => ({ label: category.name, path: `/categories/${category.slug}` })),
	);
	protected readonly appLinks = computed<TagLink[]>(() =>
		apps
			.filter((app) => this.teacher()?.apps.includes(app.slug))
			.map((app) => ({ label: app.name, path: `/apps/${app.slug}` })),
	);

	constructor() {
		void this.teachers.load();
	}
}
