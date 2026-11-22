import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import type { School, Student } from '../../feature/edudb/edudb.models';
import { SLUG_PATTERN } from '../../feature/edudb/slug';
import { SchoolsService } from '../../feature/schools/schools.service';

const EMPTY: School = { slug: '', name: '', city: '', description: '' };

/** Admin: create, edit and delete schools (Firestore: edudb_schools). The slug is the page address, `/schools#kp-7`. */
@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Admin
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Schools
			</h1>

			<h2
				class="mb-4 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				[translate]="editing() ? 'Edit school' : 'Add a school'"
			>
				{{ editing() ? 'Edit school' : 'Add a school' }}
			</h2>
			<form class="grid max-w-xl gap-4" (submit)="save($event)">
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>Slug</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal disabled:opacity-60"
						[value]="draft().slug"
						[disabled]="editing()"
						(input)="set('slug', $any($event.target).value)"
						placeholder="kp-7"
						autocomplete="off"
					/>
					<span class="text-xs font-normal text-[var(--c-text-muted)]" translate>
						Lower case letters, digits and dashes. It becomes the page address.
					</span>
				</label>
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>Name</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
						[value]="draft().name"
						(input)="set('name', $any($event.target).value)"
						autocomplete="off"
					/>
				</label>
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>City</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
						[value]="draft().city"
						(input)="set('city', $any($event.target).value)"
						autocomplete="off"
					/>
				</label>
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>Description</span>
					<textarea
						class="theme-focus min-h-24 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 py-2 font-normal"
						[value]="draft().description"
						(input)="set('description', $any($event.target).value)"
					></textarea>
				</label>
				@if (editing()) {
					<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
						<span translate>Director</span>
						<select
							class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
							[value]="draft().directorUid ?? ''"
							(change)="set('directorUid', $any($event.target).value)"
						>
							<option value="" translate>No director</option>
							@for (person of candidates(); track person.uid) {
								<option
									[value]="person.uid"
									[selected]="person.uid === (draft().directorUid ?? '')"
								>
									{{ person.displayName || person.uid }}
								</option>
							}
						</select>
						<span class="text-xs font-normal text-[var(--c-text-muted)]" translate>
							Students who chose this school can be its director.
						</span>
					</label>
				}
				<div class="flex flex-wrap gap-2">
					<button
						type="submit"
						class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)] disabled:opacity-60"
						[disabled]="!valid() || busy()"
						translate
					>
						Save
					</button>
					@if (editing()) {
						<button
							type="button"
							class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)]"
							(click)="reset()"
							translate
						>
							Cancel
						</button>
					}
				</div>
				@if (error()) {
					<p class="font-semibold text-red-600 dark:text-red-400" role="alert" translate>
						Something went wrong. Please try again.
					</p>
				}
			</form>

			<h2
				class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				All schools
			</h2>
			@if (schools.schools().length) {
				<ul class="grid gap-3">
					@for (school of schools.schools(); track school.slug) {
						<li
							class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-4"
						>
							<div>
								<p class="font-semibold text-[var(--c-text-strong)]">
									{{ school.name }}
								</p>
								<p class="text-sm text-[var(--c-text-muted)]">
									{{ school.city }}, #{{ school.slug }}
								</p>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<a
									class="theme-focus text-sm font-semibold text-[var(--c-primary)] underline"
									routerLink="/schools"
									[fragment]="school.slug"
									translate
								>
									Open the page
								</a>
								<button
									type="button"
									class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border border-[var(--c-border)] px-4 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)]"
									(click)="edit(school)"
									translate
								>
									Edit
								</button>
								@if (confirming() === school.slug) {
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white"
										(click)="remove(school)"
										translate
									>
										Confirm delete
									</button>
								} @else {
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border border-[var(--c-border)] px-4 text-sm font-semibold text-[var(--c-text-strong)] hover:border-red-600"
										(click)="confirming.set(school.slug)"
										translate
									>
										Delete
									</button>
								}
							</div>
						</li>
					}
				</ul>
			} @else if (schools.loaded()) {
				<p class="text-[var(--c-text-muted)]" translate>No schools yet.</p>
			} @else {
				<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
			}
		</div>
	`,
})
export class AdminSchoolsComponent {
	protected readonly schools = inject(SchoolsService);

	protected readonly draft = signal<School>({ ...EMPTY });
	protected readonly editing = signal(false);
	protected readonly busy = signal(false);
	protected readonly error = signal(false);
	protected readonly confirming = signal('');
	/** The people who chose the school being edited: one of them can be made its director. */
	protected readonly candidates = signal<Student[]>([]);
	protected readonly valid = computed(() => {
		const draft = this.draft();

		return SLUG_PATTERN.test(draft.slug) && !!draft.name.trim() && !!draft.city.trim();
	});

	constructor() {
		void this.schools.load();
	}

	protected set(key: keyof School, value: string) {
		this.draft.update((draft) => ({
			...draft,
			[key]: key === 'slug' ? value.trim().toLowerCase() : value,
		}));
	}

	protected edit(school: School) {
		this.draft.set({ ...school });
		this.editing.set(true);
		this.candidates.set([]);
		void this.schools.students(school.slug).then((list) => this.candidates.set(list));
	}

	protected reset() {
		this.draft.set({ ...EMPTY });
		this.editing.set(false);
		this.candidates.set([]);
		this.error.set(false);
	}

	protected async save(event: Event) {
		event.preventDefault();

		if (!this.valid()) return;

		this.busy.set(true);
		this.error.set(false);

		try {
			const draft = this.draft();

			await this.schools.save({
				slug: draft.slug,
				name: draft.name.trim(),
				city: draft.city.trim(),
				description: draft.description.trim(),
				directorUid: draft.directorUid ?? '',
			});
			this.reset();
		} catch {
			this.error.set(true);
		} finally {
			this.busy.set(false);
		}
	}

	protected async remove(school: School) {
		this.error.set(false);

		try {
			await this.schools.remove(school.slug);
		} catch {
			this.error.set(true);
		} finally {
			this.confirming.set('');
		}
	}
}
