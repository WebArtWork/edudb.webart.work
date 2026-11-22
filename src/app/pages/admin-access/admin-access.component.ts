import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import type { TeacherRequest } from '../../feature/edudb/edudb.models';
import { AccessService } from '../../feature/roles/access.service';
import { TeachersService } from '../../feature/teachers/teachers.service';

/** Admin: approve or ignore the requests to become a teacher, and see the teachers. */
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
				Access
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				People who asked to become teachers, and the current teachers.
			</p>

			<h2
				class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Teacher requests
			</h2>
			@if (access.requests().length) {
				<ul class="grid gap-3">
					@for (request of access.requests(); track request.uid) {
						<li
							class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-4"
						>
							<div>
								<p class="font-semibold text-[var(--c-text-strong)]">
									{{ request.displayName || request.email }}
								</p>
								<p class="text-sm text-[var(--c-text-muted)]">
									{{ request.email }}
								</p>
							</div>
							@if (request.status === 'pending') {
								<div class="flex gap-2">
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full bg-[var(--c-primary)] px-4 text-sm font-semibold text-[var(--c-on-primary)] disabled:opacity-60"
										[disabled]="busy() === request.uid"
										(click)="approve(request)"
										translate
									>
										Approve
									</button>
									<button
										type="button"
										class="theme-interactive theme-focus inline-flex min-h-10 items-center rounded-full border border-[var(--c-border)] px-4 text-sm font-semibold text-[var(--c-text-strong)] hover:border-[var(--c-primary)] disabled:opacity-60"
										[disabled]="busy() === request.uid"
										(click)="ignore(request)"
										translate
									>
										Ignore
									</button>
								</div>
							} @else if (request.status === 'approved') {
								<span
									class="text-sm font-semibold text-[var(--c-text-muted)]"
									translate
									>Approved</span
								>
							} @else {
								<span
									class="text-sm font-semibold text-[var(--c-text-muted)]"
									translate
									>Ignored</span
								>
							}
						</li>
					}
				</ul>
			} @else if (access.failed()) {
				<p class="text-[var(--c-text-muted)]" translate>
					Could not load the list. Try again later.
				</p>
			} @else if (access.loaded()) {
				<p class="text-[var(--c-text-muted)]" translate>No requests yet.</p>
			} @else {
				<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
			}

			<h2
				class="page-section-title mb-4 mt-12 text-2xl font-bold tracking-[-0.02em] text-[var(--c-text-strong)]"
				translate
			>
				Teachers
			</h2>
			@if (teachers.teachers().length) {
				<ul class="grid gap-3">
					@for (teacher of teachers.teachers(); track teacher.slug) {
						<li
							class="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-4"
						>
							<div>
								<p class="font-semibold text-[var(--c-text-strong)]">
									{{ teacher.name }}
								</p>
								<p class="text-sm text-[var(--c-text-muted)]">{{ teacher.slug }}</p>
							</div>
							<a
								class="theme-focus text-sm font-semibold text-[var(--c-primary)] underline"
								routerLink="/teachers"
								[fragment]="teacher.slug"
								translate
							>
								Open the page
							</a>
						</li>
					}
				</ul>
			} @else if (teachers.loaded()) {
				<p class="text-[var(--c-text-muted)]" translate>No teachers yet.</p>
			} @else {
				<p class="text-[var(--c-text-muted)]" translate>Loading...</p>
			}

			@if (error()) {
				<p class="mt-4 font-semibold text-red-600 dark:text-red-400" role="alert" translate>
					Something went wrong. Please try again.
				</p>
			}
		</div>
	`,
})
export class AdminAccessComponent {
	protected readonly access = inject(AccessService);
	protected readonly teachers = inject(TeachersService);

	protected readonly busy = signal('');
	protected readonly error = signal(false);

	constructor() {
		void this.access.load();
		void this.teachers.load();
	}

	protected approve(request: TeacherRequest) {
		return this._run(request, () => this.access.approve(request));
	}

	protected ignore(request: TeacherRequest) {
		return this._run(request, () => this.access.ignore(request));
	}

	private async _run(request: TeacherRequest, action: () => Promise<void>) {
		this.busy.set(request.uid);
		this.error.set(false);

		try {
			await action();
		} catch {
			this.error.set(true);
		} finally {
			this.busy.set('');
		}
	}
}
