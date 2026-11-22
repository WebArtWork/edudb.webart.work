import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { PreferencesComponent } from '../../components/preferences/preferences.component';
import { AuthService } from '../../feature/auth/auth.service';
import { categories } from '../../feature/edudb/edudb.data';
import { placeLabel } from '../../feature/edudb/edudb.models';
import { ProfileService } from '../../feature/profile/profile.service';
import { RoleService } from '../../feature/roles/role.service';
import { SchoolsService } from '../../feature/schools/schools.service';
import { TeachersService } from '../../feature/teachers/teachers.service';
import { UniversitiesService } from '../../feature/universities/universities.service';

/** The profile of the signed-in user (the route is behind `authGuard`). */
@Component({
	imports: [PreferencesComponent, RouterLink, TranslateDirective],
	template: `
		@if (user(); as user) {
			<div class="directory-page">
				<header class="flex items-center justify-between gap-4">
					<p
						class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
						translate
					>
						Profile
					</p>
					<button
						type="button"
						class="theme-interactive theme-focus inline-flex min-h-12 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)] disabled:opacity-70"
						[disabled]="signingOut()"
						(click)="signOut()"
						translate
					>
						Sign out
					</button>
				</header>
				<div class="my-6 flex flex-wrap items-center gap-5">
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
							class="grid h-22 w-22 flex-none place-items-center rounded-full bg-[hsl(220_55%_38%)] text-3xl font-bold text-white"
							aria-hidden="true"
						>
							{{ initial() }}
						</span>
					}
					<div>
						<h1
							class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)]"
						>
							{{ user.displayName || user.email }}
						</h1>
						@if (user.displayName) {
							<p class="text-[var(--c-text-muted)]">{{ user.email }}</p>
						}
						@if (roleLabel(); as label) {
							<p
								class="mt-2 inline-block rounded-full bg-[var(--c-bg-tertiary)] px-3 py-1 text-sm font-semibold text-[var(--c-text-strong)]"
								[translate]="label"
							>
								{{ label }}
							</p>
						}
					</div>
				</div>
				@if (profileFailed()) {
					<p class="mb-6 font-semibold text-red-600 dark:text-red-400" role="alert" translate>
						Your details could not be loaded. Reload the page to try again.
					</p>
				}
				@if (profiles.profile(); as about) {
					<h2
						class="mb-3 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
						translate
					>
						About you
					</h2>
					<dl class="mb-12 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
						<div
							class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
						>
							<dt
								class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
								translate
							>
								Full name
							</dt>
							<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
								{{ about.fullName }}
							</dd>
						</div>
						<div
							class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
						>
							<dt
								class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
								translate
							>
								Date of birth
							</dt>
							<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
								{{ about.birthDate }}
							</dd>
						</div>
						@if (schoolLabel()) {
							<div
								class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
							>
								<dt
									class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
									translate
								>
									School
								</dt>
								<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
									{{ schoolLabel() }}
								</dd>
							</div>
						}
						@if (universityLabel()) {
							<div
								class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
							>
								<dt
									class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
									translate
								>
									University
								</dt>
								<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
									{{ universityLabel() }}
								</dd>
							</div>
						}
					</dl>
					@if (lessonNames().length) {
						<h3
							class="-mt-6 mb-3 text-base font-semibold text-[var(--c-text-muted)]"
							translate
						>
							Lessons to improve
						</h3>
						<ul class="mb-12 flex flex-wrap gap-2">
							@for (lesson of lessonNames(); track lesson) {
								<li
									class="rounded-full bg-[var(--c-bg-tertiary)] px-3 py-1 text-sm font-semibold text-[var(--c-text-strong)]"
									[translate]="lesson"
								>
									{{ lesson }}
								</li>
							}
						</ul>
					}
					@if (about.hobbies.length) {
						<h3
							class="-mt-6 mb-3 text-base font-semibold text-[var(--c-text-muted)]"
							translate
						>
							Hobbies
						</h3>
						<ul class="mb-12 flex flex-wrap gap-2">
							@for (hobby of about.hobbies; track hobby) {
								<li
									class="rounded-full bg-[var(--c-bg-tertiary)] px-3 py-1 text-sm font-semibold text-[var(--c-text-strong)]"
									[translate]="hobby"
								>
									{{ hobby }}
								</li>
							}
						</ul>
					}
				}

				<h2
					class="mb-3 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Role
				</h2>
				@switch (roles.role()) {
					@case ('admin') {
						<p class="text-[var(--c-text)]" translate>You are an admin.</p>
						<ul class="mt-3 flex flex-wrap gap-3">
							<li>
								<a
									class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)]"
									routerLink="/admin/access"
									translate
								>
									Access
								</a>
							</li>
							<li>
								<a
									class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)]"
									routerLink="/admin/schools"
									translate
								>
									Manage schools
								</a>
							</li>
							<li>
								<a
									class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)]"
									routerLink="/admin/universities"
									translate
								>
									Manage universities
								</a>
							</li>
						</ul>
					}
					@case ('teacher') {
						<p class="text-[var(--c-text)]" translate>You are a teacher.</p>
						<p class="mt-3">
							<a
								class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)]"
								routerLink="/teacher"
								translate
							>
								Open the teacher dashboard
							</a>
						</p>
						@if (myTeacher(); as teacher) {
							<p class="mt-2">
								<a
									class="theme-focus underline"
									routerLink="/teachers"
									[fragment]="teacher.slug"
									translate
								>
									Open your teacher page
								</a>
							</p>
						}
					}
					@default {
						@switch (roles.request()?.status) {
							@case ('pending') {
								<p class="text-[var(--c-text)]" translate>
									Your request is waiting for approval.
								</p>
							}
							@case ('ignored') {
								<p class="text-[var(--c-text)]" translate>
									Your request was not approved.
								</p>
							}
							@case (undefined) {
								<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
							}
							@default {
								<p class="text-[var(--c-text)]" translate>
									Are you a teacher? Ask for access, and an admin will review your
									request.
								</p>
								<p class="mt-3">
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)] disabled:opacity-60"
										[disabled]="requesting()"
										(click)="requestTeacher()"
										translate
									>
										Request to be a teacher
									</button>
								</p>
							}
						}
					}
				}
				@if (roles.directorSchool(); as school) {
					<p
						class="mt-4 text-[var(--c-text)]"
						[translate]="'You run {{school}}.'"
						[vars]="{ school: school.name }"
					>
						You run {{ school.name }}.
					</p>
					<p class="mt-3">
						<a
							class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)]"
							routerLink="/director"
							translate
						>
							Open the director dashboard
						</a>
					</p>
				}
				@if (error()) {
					<p
						class="mt-3 font-semibold text-red-600 dark:text-red-400"
						role="alert"
						translate
					>
						Something went wrong. Please try again.
					</p>
				}

				<h2
					class="mb-3 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Your school
				</h2>
				@if (schools.schools().length) {
					<div class="flex flex-wrap items-center gap-3">
						<select
							class="theme-focus min-h-11 min-w-56 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-primary)] px-3"
							aria-label="School"
							[value]="school()"
							(change)="school.set($any($event.target).value)"
						>
							<option value="" translate>No school</option>
							@for (item of schools.schools(); track item.slug) {
								<option [value]="item.slug" [selected]="item.slug === school()">
									{{ label(item) }}
								</option>
							}
						</select>
						<button
							type="button"
							class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full border border-[var(--c-border)] px-5 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)] disabled:opacity-60"
							[disabled]="savingSchool()"
							(click)="saveSchool()"
							translate
						>
							Save
						</button>
						@if (schoolSaved()) {
							<span class="text-sm font-semibold text-[var(--c-text-muted)]" translate
								>Saved</span
							>
						}
					</div>
					<p class="mt-2 text-sm text-[var(--c-text-muted)]" translate>
						Your name and photo will show on the page of your school.
					</p>
				} @else if (schools.loaded()) {
					<p class="text-[var(--c-text-muted)]" translate>No schools yet.</p>
				} @else {
					<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
				}

				<h2
					class="mb-3 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
					translate
				>
					Your ranking
				</h2>
				<p class="text-[var(--c-text-muted)]" translate>
					Your points from the apps will appear here.
				</p>
				<p class="mt-2">
					<a class="theme-focus underline" routerLink="/rankings" translate>
						See the overall ranking
					</a>
				</p>

				<div class="mt-12">
					<app-preferences />
				</div>
			</div>
		}
	`,
})
export class ProfileComponent {
	private readonly _auth = inject(AuthService);
	private readonly _router = inject(Router);

	protected readonly roles = inject(RoleService);
	protected readonly schools = inject(SchoolsService);
	protected readonly profiles = inject(ProfileService);
	private readonly _universities = inject(UniversitiesService);
	/** A place in the lists: the city, then the name. */
	protected readonly label = placeLabel;
	private readonly _teachers = inject(TeachersService);

	protected readonly user = this._auth.user;
	protected readonly signingOut = signal(false);
	protected readonly requesting = signal(false);
	protected readonly error = signal(false);
	protected readonly school = signal('');
	protected readonly savingSchool = signal(false);
	protected readonly schoolSaved = signal(false);
	/** The private details could not be read (the guard lets the person in, so nothing is overwritten). */
	protected readonly profileFailed = signal(false);
	protected readonly photo = computed(() => {
		const url = this.user()?.photoURL;

		return url && url.startsWith('https://') ? url : '';
	});
	protected readonly initial = computed(() => {
		const user = this.user();

		return ((user?.displayName || user?.email || '?').trim()[0] ?? '?').toUpperCase();
	});
	protected readonly roleLabel = computed(() => {
		switch (this.roles.role()) {
			case 'admin':
				return 'Admin';
			case 'teacher':
				return 'Teacher';
			case 'user':
				return 'User';
			default:
				return '';
		}
	});
	protected readonly schoolLabel = computed(() => {
		const about = this.profiles.profile();

		if (about?.schoolName)
			return placeLabel({ city: about.schoolCity, name: about.schoolName });

		const chosen = this.schools.schools().find((item) => item.slug === this.school());

		return chosen ? placeLabel(chosen) : '';
	});
	protected readonly universityLabel = computed(() => {
		const about = this.profiles.profile();

		if (!about) return '';

		if (about.universitySlug) {
			const found = this._universities
				.universities()
				.find((item) => item.slug === about.universitySlug);

			// an admin may have removed the university from the list since
			return found ? placeLabel(found) : '';
		}

		if (about.universityName) {
			return placeLabel({ city: about.universityCity, name: about.universityName });
		}

		return about.university ?? '';
	});
	/** The subjects to improve: the names of the chosen categories, then the ones the person typed. */
	protected readonly lessonNames = computed(() => {
		const about = this.profiles.profile();

		return [
			...(about?.lessons ?? []).map(
				(slug) => categories.find((category) => category.slug === slug)?.name ?? slug,
			),
			...(about?.otherLessons ?? []),
		];
	});
	protected readonly myTeacher = computed(() =>
		this._teachers.teachers().find((teacher) => teacher.uid === this.user()?.uid),
	);

	constructor() {
		void this.roles.loadRequest();
		void this._teachers.load();
		void this.schools.load();
		void this._universities.load();
		void this._loadSchool();
		void this.profiles.whenLoaded().catch(() => this.profileFailed.set(true));
	}

	protected async requestTeacher() {
		this.requesting.set(true);
		this.error.set(false);

		try {
			await this.roles.requestTeacher();
		} catch {
			this.error.set(true);
		} finally {
			this.requesting.set(false);
		}
	}

	protected async saveSchool() {
		const user = this.user();

		if (!user) return;

		this.savingSchool.set(true);
		this.schoolSaved.set(false);
		this.error.set(false);

		try {
			// the age decides how much of the person the school page shows, so the profile must be read first
			const about = await this.profiles.whenLoaded();
			const slug = this.school();

			this.profileFailed.set(false);
			await this.schools.choose(user, slug, this.profiles.isMinor());

			// a school from the list replaces the one the person typed in the onboarding
			if (slug && about?.schoolName) {
				await this.profiles.save(
					{ ...this.profiles.answersOf(about), schoolName: '', schoolCity: '' },
					about.onboarded,
				);
			}

			this.schoolSaved.set(true);
		} catch {
			this.error.set(true);
		} finally {
			this.savingSchool.set(false);
		}
	}

	protected async signOut() {
		this.signingOut.set(true);

		try {
			await this._auth.signOut();
			await this._router.navigateByUrl('/sign');
		} finally {
			this.signingOut.set(false);
		}
	}

	private async _loadSchool() {
		const user = await this._auth.whenReady();

		if (user) this.school.set(await this.schools.chosen(user.uid).catch(() => ''));
	}
}
