import { Component, computed, inject, signal } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { placeLabel, type University } from '../../feature/edudb/edudb.models';
import { SLUG_PATTERN } from '../../feature/edudb/slug';
import { UniversitiesService } from '../../feature/universities/universities.service';

const EMPTY: University = { slug: '', name: '', city: '' };

/** Admin: create, edit and delete universities (Firestore: edudb_universities). People pick them in the onboarding. */
@Component({
	imports: [TranslateDirective],
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
				Universities
			</h1>

			<h2
				class="mb-4 mt-10 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				[translate]="editing() ? 'Edit university' : 'Add a university'"
			>
				{{ editing() ? 'Edit university' : 'Add a university' }}
			</h2>
			<form class="grid max-w-xl gap-4" (submit)="save($event)">
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>Slug</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal disabled:opacity-60"
						[value]="draft().slug"
						[disabled]="editing()"
						(input)="set('slug', $any($event.target).value)"
						placeholder="knu"
						autocomplete="off"
					/>
					<span class="text-xs font-normal text-[var(--c-text-muted)]" translate>
						Lower case letters, digits and dashes.
					</span>
				</label>
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>Name</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
						[value]="draft().name"
						(input)="set('name', $any($event.target).value)"
						maxlength="120"
						autocomplete="off"
					/>
				</label>
				<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
					<span translate>City</span>
					<input
						class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
						[value]="draft().city"
						(input)="set('city', $any($event.target).value)"
						maxlength="120"
						autocomplete="off"
					/>
				</label>
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
				class="mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				All universities
			</h2>
			@if (universities.universities().length) {
				<ul class="grid gap-3">
					@for (item of universities.universities(); track item.slug) {
						<li
							class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-4"
						>
							<div>
								<p class="font-semibold text-[var(--c-text-strong)]">
									{{ label(item) }}
								</p>
								<p class="text-sm text-[var(--c-text-muted)]">#{{ item.slug }}</p>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<button
									type="button"
									class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border border-[var(--c-border)] px-4 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)]"
									(click)="edit(item)"
									translate
								>
									Edit
								</button>
								@if (confirming() === item.slug) {
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white"
										(click)="remove(item)"
										translate
									>
										Confirm delete
									</button>
								} @else {
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border border-[var(--c-border)] px-4 text-sm font-semibold text-[var(--c-text-strong)] hover:border-red-600"
										(click)="confirming.set(item.slug)"
										translate
									>
										Delete
									</button>
								}
							</div>
						</li>
					}
				</ul>
			} @else if (universities.loaded()) {
				<p class="text-[var(--c-text-muted)]" translate>No universities yet.</p>
			} @else {
				<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
			}
		</div>
	`,
})
export class AdminUniversitiesComponent {
	protected readonly universities = inject(UniversitiesService);
	protected readonly label = placeLabel;

	protected readonly draft = signal<University>({ ...EMPTY });
	protected readonly editing = signal(false);
	protected readonly busy = signal(false);
	protected readonly error = signal(false);
	protected readonly confirming = signal('');
	protected readonly valid = computed(() => {
		const draft = this.draft();

		return SLUG_PATTERN.test(draft.slug) && !!draft.name.trim() && !!draft.city.trim();
	});

	constructor() {
		void this.universities.load();
	}

	protected set(key: keyof University, value: string) {
		this.draft.update((draft) => ({
			...draft,
			[key]: key === 'slug' ? value.trim().toLowerCase() : value,
		}));
	}

	protected edit(item: University) {
		this.draft.set({ ...item });
		this.editing.set(true);
	}

	protected reset() {
		this.draft.set({ ...EMPTY });
		this.editing.set(false);
		this.error.set(false);
	}

	protected async save(event: Event) {
		event.preventDefault();

		if (!this.valid()) return;

		this.busy.set(true);
		this.error.set(false);

		try {
			const draft = this.draft();

			await this.universities.save({
				slug: draft.slug,
				name: draft.name.trim(),
				city: draft.city.trim(),
			});
			this.reset();
		} catch {
			this.error.set(true);
		} finally {
			this.busy.set(false);
		}
	}

	protected async remove(item: University) {
		this.error.set(false);

		try {
			await this.universities.remove(item.slug);
		} catch {
			this.error.set(true);
		} finally {
			this.confirming.set('');
		}
	}
}
