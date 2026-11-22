import { inject, Service, signal } from '@angular/core';
import type { User } from 'firebase/auth';
import { FirebaseService } from '../firebase/firebase.service';

/** Firebase Auth with Google. The signed-in user only exists in the browser. */
@Service()
export class AuthService {
	private readonly _firebase = inject(FirebaseService);

	/** `undefined` until Firebase has restored the session; `null` when nobody is signed in. */
	readonly user = signal<User | null | undefined>(undefined);

	private _ready: Promise<void> | null = null;

	/** Resolves with the current user (or `null`) once Firebase has checked the saved session. */
	async whenReady(): Promise<User | null> {
		this._ready ??= this._restore();
		await this._ready;

		return this.user() ?? null;
	}

	async signInWithGoogle(): Promise<User> {
		const auth = await this._firebase.auth();
		if (!auth) throw new Error('Sign in is only available in the browser.');

		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const { user } = await signInWithPopup(auth, new GoogleAuthProvider());

		this.user.set(user);

		return user;
	}

	async signOut(): Promise<void> {
		const auth = await this._firebase.auth();
		if (!auth) return;

		const { signOut } = await import('firebase/auth');
		await signOut(auth);
		this.user.set(null);
	}

	private async _restore(): Promise<void> {
		const auth = await this._firebase.auth();
		if (!auth) {
			this.user.set(null);

			return;
		}

		const { onAuthStateChanged } = await import('firebase/auth');
		await new Promise<void>((resolve) => {
			let first = true;

			onAuthStateChanged(auth, (user) => {
				this.user.set(user);

				if (first) {
					first = false;
					resolve();
				}
			});
		});
	}
}
