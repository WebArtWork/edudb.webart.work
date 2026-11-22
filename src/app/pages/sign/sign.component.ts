import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { PreferencesComponent } from '../../components/preferences/preferences.component';
import { AuthService } from '../../feature/auth/auth.service';

/** What to tell the person for the sign-in errors we know; anything else gets the generic message. */
const MESSAGES: Record<string, string> = {
	'auth/unauthorized-domain': 'Sign in is not enabled for this address yet.',
	'auth/popup-blocked':
		'The browser blocked the sign-in window. Allow pop-ups for this site and try again.',
	'auth/operation-not-allowed': 'Google sign-in is not turned on for this project.',
	'auth/network-request-failed': 'No connection. Check your network and try again.',
};

@Component({
	imports: [PreferencesComponent, TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Sign in
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Sign in to EduDB
			</h1>
			<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]" translate>
				Use your Google account to get a profile. Your points from the apps will show there.
			</p>
			<p class="mt-6">
				<button
					type="button"
					class="theme-interactive theme-focus inline-flex min-h-12 items-center gap-2.5 rounded-full border-2 border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-5 font-bold text-[var(--c-text-strong)] hover:border-[var(--c-primary)] disabled:cursor-wait disabled:opacity-70"
					[disabled]="busy()"
					(click)="signIn()"
				>
					<svg class="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
						<path
							fill="#EA4335"
							d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
						/>
						<path
							fill="#4285F4"
							d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
						/>
						<path
							fill="#FBBC05"
							d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
						/>
						<path
							fill="#34A853"
							d="M24 48c6.3 0 11.8-2.1 15.7-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-8.1 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
						/>
					</svg>
					<span translate>Sign in with Google</span>
				</button>
			</p>
			@if (error()) {
				<p
					class="mt-3 font-semibold text-red-600 dark:text-red-400"
					role="alert"
					[translate]="error()"
				>
					{{ error() }}
				</p>
				@if (errorCode()) {
					<p class="mt-1 text-sm text-[var(--c-text-muted)]">{{ errorCode() }}</p>
				}
			}

			<div class="mt-12">
				<app-preferences />
			</div>
		</div>
	`,
})
export class SignComponent {
	private readonly _auth = inject(AuthService);
	private readonly _router = inject(Router);

	protected readonly busy = signal(false);
	protected readonly error = signal('');
	protected readonly errorCode = signal('');

	constructor() {
		// load Firebase before the click: the popup must open right away, or the browser blocks it
		void this._auth.whenReady();
	}

	protected async signIn() {
		this.busy.set(true);
		this.error.set('');
		this.errorCode.set('');

		try {
			await this._auth.signInWithGoogle();
			await this._router.navigateByUrl('/profile');
		} catch (error) {
			const code = (error as { code?: string }).code ?? '';

			if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
				return;
			}

			// the real reason, for whoever debugs it
			console.error('Google sign-in failed', error);
			this.errorCode.set(code);
			this.error.set(MESSAGES[code] ?? 'Sign in failed. Please try again.');
		} finally {
			this.busy.set(false);
		}
	}
}
