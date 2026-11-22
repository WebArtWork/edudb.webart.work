import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import type { Student } from '../../feature/edudb/edudb.models';
import { hueOf } from '../../feature/edudb/edudb.queries';
import { SchoolsService } from '../../feature/schools/schools.service';

/** `/schools` is the list; `/schools#<slug>` is one school with its rating (Firestore documents). */
@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<div class="directory-page">
			@if (slug()) {
				<p class="mb-4 flex flex-wrap gap-x-2 text-sm text-[var(--c-text-muted)]">
					<a class="theme-focus underline" routerLink="/schools" translate>Schools</a>
					@if (school(); as school) {
						<span aria-hidden="true">/</span>
						<span>{{ school.name }}</span>
					}
				</p>

				@if (school(); as school) {
					<article>
						<p
							class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
						>
							{{ school.city }}
						</p>
						<h1
							class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
						>
							{{ school.name }}
						</h1>
						@if (school.description) {
							<p class="mt-4 max-w-[65ch] text-[var(--c-text)]">
								{{ school.description }}
							</p>
						}

						<h2
							class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
							translate
						>
							Rating
						</h2>
						<dl class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
							<div
								class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
							>
								<dt
									class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
									translate
								>
									Students
								</dt>
								<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
									{{ students().length }}
								</dd>
							</div>
							<div
								class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
							>
								<dt
									class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
									translate
								>
									Total points
								</dt>
								<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
									{{ total() }}
								</dd>
							</div>
						</dl>

						@if (students().length) {
							<div
								class="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)]"
							>
								<table class="w-full border-collapse text-sm tabular-nums">
									<caption
										class="border-b border-[var(--c-border)] px-4 py-3 text-left font-semibold text-[var(--c-text-strong)]"
										translate
									>
										Students of the school
									</caption>
									<thead>
										<tr
											class="text-xs uppercase tracking-wider text-[var(--c-text-muted)]"
										>
											<th
												scope="col"
												class="w-px px-4 py-2 text-left"
												translate
											>
												Rank
											</th>
											<th scope="col" class="px-4 py-2 text-left" translate>
												Player
											</th>
											<th scope="col" class="px-4 py-2 text-right" translate>
												Points
											</th>
										</tr>
									</thead>
									<tbody>
										@for (
											student of students();
											track student.uid;
											let i = $index
										) {
											<tr class="border-t border-[var(--c-border)]">
												<td class="px-4 py-2.5 font-extrabold">
													{{ i + 1 }}
												</td>
												<th
													scope="row"
													class="px-4 py-2.5 text-left font-semibold text-[var(--c-text-strong)]"
												>
													<span class="flex items-center gap-2.5">
														@if (photo(student)) {
															<img
																class="h-8 w-8 flex-none rounded-full"
																[src]="photo(student)"
																alt=""
																width="32"
																height="32"
																referrerpolicy="no-referrer"
															/>
														} @else {
															<span
																class="grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-bold text-white"
																[style.background]="
																	'hsl(' +
																	hue(student.uid) +
																	' 55% 38%)'
																"
																aria-hidden="true"
															>
																{{
																	(student.displayName ||
																		'?')[0].toUpperCase()
																}}
															</span>
														}
														{{ student.displayName || '-' }}
													</span>
												</th>
												<td
													class="px-4 py-2.5 text-right font-bold text-[var(--c-text-strong)]"
												>
													{{ student.points }}
												</td>
											</tr>
										}
									</tbody>
								</table>
							</div>
						} @else if (studentsLoaded()) {
							<p class="text-[var(--c-text-muted)]" translate>
								No students yet. Students pick their school in their profile.
							</p>
						}
						<p class="mt-2 text-sm text-[var(--c-text-muted)]" translate>
							Points come from the apps and are added to the school rating.
						</p>
					</article>
				} @else if (schools.loaded()) {
					<h1 class="text-3xl font-bold text-[var(--c-text-strong)]" translate>
						School not found
					</h1>
					<p class="mt-3 text-[var(--c-text-muted)]">
						<a class="theme-focus underline" routerLink="/schools" translate
							>See all schools</a
						>
					</p>
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
				}
			} @else {
				<h1
					class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
					translate
				>
					Schools
				</h1>
				<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
					Schools on EduDB, each with the rating of its students.
				</p>
				@if (schools.schools().length) {
					<ul class="mt-8 catalog-grid">
						@for (item of schools.schools(); track item.slug) {
							<li>
								<a
									class="theme-interactive theme-focus flex h-full flex-col gap-1 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-5 hover:border-[var(--c-primary)]"
									routerLink="/schools"
									[fragment]="item.slug"
								>
									<h3 class="text-base font-semibold text-[var(--c-text-strong)]">
										{{ item.name }}
									</h3>
									<p class="text-sm text-[var(--c-text-muted)]">
										{{ item.city }}
									</p>
								</a>
							</li>
						}
					</ul>
				} @else if (schools.failed()) {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>
						Could not load the list. Try again later.
					</p>
				} @else if (schools.loaded()) {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>No schools yet.</p>
				} @else {
					<p class="mt-8 text-[var(--c-text-muted)]" translate>Loading...</p>
				}
			}
		</div>
	`,
})
export class SchoolsComponent {
	protected readonly schools = inject(SchoolsService);
	protected readonly slug = toSignal(inject(ActivatedRoute).fragment, { initialValue: null });

	protected readonly students = signal<Student[]>([]);
	protected readonly studentsLoaded = signal(false);
	protected readonly school = computed(() => {
		const slug = this.slug();

		return slug ? this.schools.schools().find((item) => item.slug === slug) : undefined;
	});
	protected readonly total = computed(() =>
		this.students().reduce((sum, student) => sum + (student.points || 0), 0),
	);

	constructor() {
		void this.schools.load();

		effect(() => {
			const school = this.school();

			this.students.set([]);
			this.studentsLoaded.set(false);

			if (school) {
				void this.schools
					.students(school.slug)
					.then((list) => this.students.set(list))
					.catch(() => this.students.set([]))
					.finally(() => this.studentsLoaded.set(true));
			}
		});
	}

	protected photo(student: Student) {
		return student.photoUrl.startsWith('https://') ? student.photoUrl : '';
	}

	protected hue(value: string) {
		return hueOf(value);
	}
}
