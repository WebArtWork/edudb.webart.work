import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { AuthService } from '../../feature/auth/auth.service';
import { TeachersService } from '../../feature/teachers/teachers.service';

/** The dashboard of an approved teacher (behind `teacherGuard`). More teacher pages go under /teacher. */
@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Teacher
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Teacher dashboard
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				Your public page and your account.
			</p>

			<h2
				class="mb-3 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Your page
			</h2>
			@if (teacher(); as teacher) {
				<div
					class="max-w-xl rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-5"
				>
					<p class="text-lg font-semibold text-[var(--c-text-strong)]">
						{{ teacher.name }}
					</p>
					<p class="text-sm text-[var(--c-text-muted)]">{{ teacher.role }}</p>
					@if (teacher.subject) {
						<p class="mt-2 text-sm text-[var(--c-text)]">{{ teacher.subject }}</p>
					}
					@if (teacher.short) {
						<p class="mt-2 text-sm text-[var(--c-text)]">{{ teacher.short }}</p>
					}
					<p class="mt-4">
						<a
							class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)]"
							routerLink="/teachers"
							[fragment]="teacher.slug"
							translate
						>
							Open your public page
						</a>
					</p>
				</div>
				<p class="mt-3 text-sm text-[var(--c-text-muted)]" translate>
					Editing your page is coming soon.
				</p>
			} @else if (teachers.loaded()) {
				<p class="text-[var(--c-text-muted)]" translate>Your teacher page was not found.</p>
			} @else {
				<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
			}

			<p class="mt-10">
				<a class="theme-focus underline" routerLink="/profile" translate
					>Back to your profile</a
				>
			</p>
		</div>
	`,
})
export class TeacherDashboardComponent {
	protected readonly teachers = inject(TeachersService);
	private readonly _auth = inject(AuthService);

	protected readonly teacher = computed(() =>
		this.teachers.teachers().find((item) => item.uid === this._auth.user()?.uid),
	);

	constructor() {
		void this.teachers.load();
	}
}
