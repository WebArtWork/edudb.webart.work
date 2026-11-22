import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { AuthService } from '../../feature/auth/auth.service';
import { categories } from '../../feature/edudb/edudb.data';
import { placeLabel } from '../../feature/edudb/edudb.models';
import { ADULT_AGE, ageOf, todayIso } from '../../feature/profile/age';
import { ProfileService, type ProfileAnswers } from '../../feature/profile/profile.service';
import { SchoolsService } from '../../feature/schools/schools.service';
import { UniversitiesService } from '../../feature/universities/universities.service';

const HOBBIES = [
	'Chess',
	'Cooking',
	'Fitness',
	'Reading',
	'Music',
	'Sports',
	'Coding',
	'Drawing',
	'Travel',
	'Gaming',
];
/** The school subjects a student can pick to improve (the school categories). */
const LESSONS = categories.filter((category) => category.group === 'school');
const STEPS = 3;
/** The value of the "not in the list" option of the school and university lists. */
const OTHER = '__other';

/** Comma separated text as a list: trimmed, no empty items, each at most 60 characters. */
const split = (text: string): string[] =>
	[
		...new Set(
			text
				.split(',')
				.map((item) => item.trim().slice(0, 60))
				.filter(Boolean),
		),
	].slice(0, 20);

/**
 * Shown once, after the first sign-in: name and date of birth, then (by age) school, and university for
 * adults, then hobbies. A school or university that is not in the list is typed with its city. Every step
 * is saved as a draft. The profile page stays closed until it is done.
 */
@Component({
	imports: [TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Welcome
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Tell us about yourself
			</h1>
			<p
				class="mt-4 text-sm font-semibold text-[var(--c-text-muted)]"
				[translate]="'Step {{step}} of {{total}}'"
				[vars]="{ step: step(), total: total }"
			>
				Step {{ step() }} of {{ total }}
			</p>

			<form class="mt-6 grid max-w-xl gap-5" (submit)="next($event)">
				@switch (step()) {
					@case (1) {
						<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
							<span translate>Full name</span>
							<input
								class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
								[value]="fullName()"
								(input)="fullName.set($any($event.target).value)"
								autocomplete="name"
								maxlength="200"
							/>
						</label>
						<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
							<span translate>Date of birth</span>
							<input
								type="date"
								class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
								[value]="birthDate()"
								[max]="today"
								(input)="birthDate.set($any($event.target).value)"
								autocomplete="bday"
							/>
						</label>
					}
					@case (2) {
						<div class="grid gap-3">
							<label
								class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
							>
								<span translate>Your school</span>
								<select
									class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
									[value]="school()"
									(change)="school.set($any($event.target).value)"
								>
									<option value="" translate>Choose a school</option>
									@for (item of schools.schools(); track item.slug) {
										<option
											[value]="item.slug"
											[selected]="item.slug === school()"
										>
											{{ label(item) }}
										</option>
									}
									<option
										[value]="other"
										[selected]="school() === other"
										translate
									>
										My school is not in the list
									</option>
								</select>
								<span
									class="text-xs font-normal text-[var(--c-text-muted)]"
									translate
								>
									Pick your school from the list. If it is not there, choose the
									last option and write it.
								</span>
							</label>
							@if (school() === other) {
								<label
									class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
								>
									<span translate>School name</span>
									<input
										class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
										[value]="schoolName()"
										(input)="schoolName.set($any($event.target).value)"
										maxlength="120"
										autocomplete="off"
									/>
								</label>
								<label
									class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
								>
									<span translate>City</span>
									<input
										class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
										[value]="schoolCity()"
										(input)="schoolCity.set($any($event.target).value)"
										maxlength="120"
										autocomplete="off"
									/>
								</label>
							}
							@if (minor()) {
								<p class="text-xs text-[var(--c-text-muted)]" translate>
									Only your first name is shown on the school page.
								</p>
							}
						</div>

						@if (!minor()) {
							<div class="grid gap-3">
								<label
									class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
								>
									<span translate>University</span>
									<select
										class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
										[value]="university()"
										(change)="university.set($any($event.target).value)"
									>
										<option value="" translate>Choose a university</option>
										@for (
											item of universities.universities();
											track item.slug
										) {
											<option
												[value]="item.slug"
												[selected]="item.slug === university()"
											>
												{{ label(item) }}
											</option>
										}
										<option
											[value]="other"
											[selected]="university() === other"
											translate
										>
											My university is not in the list
										</option>
									</select>
									<span
										class="text-xs font-normal text-[var(--c-text-muted)]"
										translate
									>
										Where do you study? You can leave it empty.
									</span>
								</label>
								@if (university() === other) {
									<label
										class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
									>
										<span translate>University name</span>
										<input
											class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
											[value]="universityName()"
											(input)="universityName.set($any($event.target).value)"
											maxlength="120"
											autocomplete="off"
										/>
									</label>
									<label
										class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
									>
										<span translate>City</span>
										<input
											class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
											[value]="universityCity()"
											(input)="universityCity.set($any($event.target).value)"
											maxlength="120"
											autocomplete="off"
										/>
									</label>
								}
							</div>
						}
					}
					@case (3) {
						@if (showLessons()) {
							<fieldset class="grid gap-3">
								<legend
									class="mb-1 text-sm font-semibold text-[var(--c-text-strong)]"
									translate
								>
									Lessons to improve
								</legend>
								<p class="text-xs text-[var(--c-text-muted)]" translate>
									Choose the school subjects you want to get better at.
								</p>
								<ul class="flex flex-wrap gap-2">
									@for (lesson of lessons; track lesson.slug) {
										<li>
											<button
												type="button"
												class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold"
												[class]="
													lessonsChosen().includes(lesson.slug)
														? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[var(--c-on-primary)]'
														: 'border-[var(--c-border)] text-[var(--c-text-strong)] hover:border-[var(--c-primary)]'
												"
												[attr.aria-pressed]="
													lessonsChosen().includes(lesson.slug)
												"
												(click)="toggleLesson(lesson.slug)"
												[translate]="lesson.name"
											>
												{{ lesson.name }}
											</button>
										</li>
									}
								</ul>
							</fieldset>
							<label
								class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]"
							>
								<span translate>Other lessons</span>
								<input
									class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
									[value]="otherLessons()"
									(input)="otherLessons.set($any($event.target).value)"
									maxlength="300"
									autocomplete="off"
								/>
								<span
									class="text-xs font-normal text-[var(--c-text-muted)]"
									translate
								>
									Optional. Separate them with commas.
								</span>
							</label>
						}
						<fieldset class="grid gap-3">
							<legend
								class="mb-1 text-sm font-semibold text-[var(--c-text-strong)]"
								translate
							>
								Hobbies
							</legend>
							<ul class="flex flex-wrap gap-2">
								@for (hobby of hobbies; track hobby) {
									<li>
										<button
											type="button"
											class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold"
											[class]="
												chosen().includes(hobby)
													? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[var(--c-on-primary)]'
													: 'border-[var(--c-border)] text-[var(--c-text-strong)] hover:border-[var(--c-primary)]'
											"
											[attr.aria-pressed]="chosen().includes(hobby)"
											(click)="toggle(hobby)"
											[translate]="hobby"
										>
											{{ hobby }}
										</button>
									</li>
								}
							</ul>
						</fieldset>
						<label class="grid gap-1 text-sm font-semibold text-[var(--c-text-strong)]">
							<span translate>Other hobbies</span>
							<input
								class="theme-focus min-h-11 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3 font-normal"
								[value]="otherHobbies()"
								(input)="otherHobbies.set($any($event.target).value)"
								maxlength="300"
								autocomplete="off"
							/>
							<span class="text-xs font-normal text-[var(--c-text-muted)]" translate>
								Optional. Separate them with commas.
							</span>
						</label>
					}
				}

				@if (error()) {
					<p
						class="font-semibold text-red-600 dark:text-red-400"
						role="alert"
						[translate]="error()"
					>
						{{ error() }}
					</p>
				}

				<div class="flex flex-wrap gap-2">
					@if (step() > 1) {
						<button
							type="button"
							class="theme-interactive theme-focus inline-flex min-h-12 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)]"
							(click)="back()"
							translate
						>
							Back
						</button>
					}
					<button
						type="submit"
						class="theme-interactive theme-focus inline-flex min-h-12 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)] disabled:opacity-60"
						[disabled]="saving()"
						[translate]="step() < total ? 'Continue' : 'Finish'"
					>
						{{ step() < total ? 'Continue' : 'Finish' }}
					</button>
				</div>
			</form>
		</div>
	`,
})
export class OnboardingComponent {
	private readonly _auth = inject(AuthService);
	private readonly _profiles = inject(ProfileService);
	private readonly _router = inject(Router);

	protected readonly schools = inject(SchoolsService);
	protected readonly universities = inject(UniversitiesService);
	protected readonly hobbies = HOBBIES;
	protected readonly total = STEPS;
	protected readonly other = OTHER;
	protected readonly label = placeLabel;
	protected readonly today = todayIso();

	protected readonly step = signal(1);
	protected readonly fullName = signal('');
	protected readonly birthDate = signal('');
	/** The slug of a school from the list, `OTHER` when it is typed below, or empty. */
	protected readonly school = signal('');
	protected readonly schoolName = signal('');
	protected readonly schoolCity = signal('');
	/** The slug of a university from the list, `OTHER` when it is typed below, or empty. */
	protected readonly university = signal('');
	protected readonly universityName = signal('');
	protected readonly universityCity = signal('');
	protected readonly lessons = LESSONS;
	/** The slugs of the school subjects the person wants to improve. */
	protected readonly lessonsChosen = signal<string[]>([]);
	protected readonly otherLessons = signal('');
	protected readonly chosen = signal<string[]>([]);
	protected readonly otherHobbies = signal('');
	protected readonly saving = signal(false);
	protected readonly error = signal('');

	protected readonly age = computed(() => ageOf(this.birthDate()));
	/** Under 18: only the school is asked. */
	/** Lessons are asked of school students: under 18, or someone who named a school. */
	protected readonly showLessons = computed(() => this.minor() || !!this.school());
	protected readonly minor = computed(() => (this.age() ?? ADULT_AGE) < ADULT_AGE);

	constructor() {
		void this.schools.load();
		void this.universities.load();
		void this._restore();
	}

	/** Fills the form from the answers saved so far, and continues from the step after the first one. */
	private async _restore() {
		const [user, saved] = await Promise.all([
			this._auth.whenReady(),
			this._profiles.whenLoaded(),
		]);

		if (saved) {
			this.fullName.set(saved.fullName);
			this.birthDate.set(saved.birthDate);
			this.lessonsChosen.set(saved.lessons ?? []);
			this.otherLessons.set((saved.otherLessons ?? []).join(', '));
			this.chosen.set(saved.hobbies.filter((hobby) => HOBBIES.includes(hobby)));
			this.otherHobbies.set(
				saved.hobbies.filter((hobby) => !HOBBIES.includes(hobby)).join(', '),
			);

			if (saved.schoolName) {
				this.school.set(OTHER);
				this.schoolName.set(saved.schoolName);
				this.schoolCity.set(saved.schoolCity);
			}

			if (saved.universitySlug) {
				this.university.set(saved.universitySlug);
			} else if (saved.universityName || saved.university) {
				// `university` is the old one-text field of earlier drafts
				this.university.set(OTHER);
				this.universityName.set(saved.universityName || saved.university || '');
				this.universityCity.set(saved.universityCity);
			}

			if (saved.fullName.trim().length >= 2 && ageOf(saved.birthDate) !== null) {
				// the step reached; drafts saved before the step was stored continue at step 2
				const reached = Number.isInteger(saved.step) ? saved.step : 2;

				this.step.set(Math.min(STEPS, Math.max(2, reached)));
			}
		} else if (user?.displayName) {
			// start from the Google name; the person types the full name
			this.fullName.set(user.displayName);
		}

		if (user && !saved?.schoolName) {
			const school = await this.schools.chosen(user.uid).catch(() => '');

			if (school && !this.school()) this.school.set(school);
		}
	}

	protected toggleLesson(slug: string) {
		this.lessonsChosen.update((list) =>
			list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug],
		);
	}

	protected toggle(hobby: string) {
		this.chosen.update((list) =>
			list.includes(hobby) ? list.filter((item) => item !== hobby) : [...list, hobby],
		);
	}

	protected back() {
		this.error.set('');
		this.step.update((step) => Math.max(1, step - 1));
	}

	protected async next(event: Event) {
		event.preventDefault();
		this.error.set('');

		if (this.step() === 1) {
			if (this.fullName().trim().length < 2) {
				this.error.set('Enter your full name.');
			} else if (this.age() === null) {
				this.error.set('Enter a valid date of birth.');
			} else {
				await this._saveDraft(2);
				this.step.set(2);
			}

			return;
		}

		if (this.step() === 2) {
			if (
				this.school() === OTHER &&
				!(this.schoolName().trim() && this.schoolCity().trim())
			) {
				this.error.set('Enter the school name and city.');

				return;
			}

			if (
				!this.minor() &&
				this.university() === OTHER &&
				!(this.universityName().trim() && this.universityCity().trim())
			) {
				this.error.set('Enter the university name and city.');

				return;
			}

			if (!(await this._saveEducation())) return;

			this.step.set(3);

			return;
		}

		await this._finish();
	}

	/** What the person has answered so far. */
	private _answers(step: number): ProfileAnswers {
		const extra = split(this.otherHobbies());
		const ownSchool = this.school() === OTHER;
		const ownUniversity = !this.minor() && this.university() === OTHER;

		return {
			fullName: this.fullName().trim(),
			birthDate: this.birthDate(),
			schoolName: ownSchool ? this.schoolName().trim() : '',
			schoolCity: ownSchool ? this.schoolCity().trim() : '',
			universitySlug:
				!this.minor() && this.university() && !ownUniversity ? this.university() : '',
			universityName: ownUniversity ? this.universityName().trim() : '',
			universityCity: ownUniversity ? this.universityCity().trim() : '',
			step,
			lessons: this.showLessons() ? this.lessonsChosen() : [],
			otherLessons: this.showLessons() ? split(this.otherLessons()) : [],
			hobbies: [...new Set([...this.chosen(), ...extra])].slice(0, 20),
		};
	}

	/** Saves the answers as a draft, so leaving the page does not lose them. A failure does not stop the person. */
	private async _saveDraft(step: number) {
		this.saving.set(true);

		try {
			await this._profiles.save(this._answers(step), false);
		} catch (error) {
			// the last step saves everything again
			console.warn('Could not save the onboarding draft', error);
		} finally {
			this.saving.set(false);
		}
	}

	/** The school from the list is a public document (the school page lists its students). */
	private async _chooseSchool(): Promise<boolean> {
		const user = await this._auth.whenReady();
		const slug = this.school();

		if (!user || !slug || slug === OTHER) return true;

		try {
			await this.schools.choose(user, slug, this.minor());

			return true;
		} catch {
			this.error.set('Something went wrong. Please try again.');

			return false;
		}
	}

	/** Step 2: the draft, and the school from the list. Returns false when the school failed. */
	private async _saveEducation(): Promise<boolean> {
		await this._saveDraft(3);

		this.saving.set(true);

		try {
			return await this._chooseSchool();
		} finally {
			this.saving.set(false);
		}
	}

	private async _finish() {
		const user = await this._auth.whenReady();

		if (!user) return;

		this.saving.set(true);

		try {
			await this._profiles.save(this._answers(STEPS), true);

			if (!(await this._chooseSchool())) return;

			await this._router.navigateByUrl('/profile');
		} catch {
			this.error.set('Something went wrong. Please try again.');
		} finally {
			this.saving.set(false);
		}
	}
}
