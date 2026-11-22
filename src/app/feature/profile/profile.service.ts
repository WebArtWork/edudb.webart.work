import { computed, inject, Service, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ADULT_AGE, ageOf } from './age';

/** The private details from the onboarding (Firestore: edudb_profiles/{uid}, readable only by the person). */
export interface PersonProfile {
	fullName: string;
	/** `YYYY-MM-DD`. */
	birthDate: string;
	/** A school that is not in the list: the person typed its name and city. Both empty otherwise. */
	schoolName: string;
	schoolCity: string;
	/** The university chosen from the list (its slug), or empty. */
	universitySlug: string;
	/** A university that is not in the list: the person typed its name and city. Both empty otherwise. */
	universityName: string;
	universityCity: string;
	/** Drafts saved before the university had its own list kept it as one text. Read only. */
	university?: string;
	/** The onboarding step the person reached (1 to 3), so a refresh continues there. Drafts from before have none. */
	step: number;
	/** School subjects the person wants to improve: the slugs of the school categories. */
	lessons: string[];
	/** Subjects that are not in the list: typed by the person. */
	otherLessons: string[];
	hobbies: string[];
	onboarded: boolean;
}

/** The answers of the onboarding, without the flag and the old text field. */
export type ProfileAnswers = Omit<PersonProfile, 'onboarded' | 'university'>;

@Service()
export class ProfileService {
	private readonly _auth = inject(AuthService);
	private readonly _firebase = inject(FirebaseService);

	/** `undefined` until loaded, `null` when the person has not done the onboarding. */
	readonly profile = signal<PersonProfile | null | undefined>(undefined);
	readonly onboarded = computed(() => this.profile()?.onboarded === true);
	/** Under 18: school only, and less of the person is shown publicly. */
	readonly isMinor = computed(() => {
		const age = ageOf(this.profile()?.birthDate ?? '');

		return age !== null && age < ADULT_AGE;
	});

	private _uid = '';
	private _loading: Promise<PersonProfile | null> | null = null;

	/**
	 * The person's profile, read once per signed-in person. Rejects when it could not be read: that is not the
	 * same as having no profile, so the caller must not start the onboarding over it. The next call tries again.
	 */
	async whenLoaded(): Promise<PersonProfile | null> {
		const user = await this._auth.whenReady();

		if (!user) {
			this._reset('');
			this.profile.set(null);

			return null;
		}

		if (this._uid !== user.uid) this._reset(user.uid);

		if (!this._loading) {
			const loading = this._fetch(user.uid);

			this._loading = loading;
			loading.catch(() => {
				if (this._loading === loading) this._loading = null;
			});
		}

		return this._loading;
	}

	/** The saved answers of a profile, ready to be saved again (old drafts kept the university as one text). */
	answersOf(profile: PersonProfile): ProfileAnswers {
		return {
			fullName: profile.fullName,
			birthDate: profile.birthDate,
			schoolName: profile.schoolName ?? '',
			schoolCity: profile.schoolCity ?? '',
			universitySlug: profile.universitySlug ?? '',
			universityName: profile.universityName || profile.university || '',
			universityCity: profile.universityCity ?? '',
			step: Number.isInteger(profile.step) ? profile.step : 3,
			lessons: profile.lessons ?? [],
			otherLessons: profile.otherLessons ?? [],
			hobbies: profile.hobbies ?? [],
		};
	}

	/**
	 * Saves the onboarding answers. After each step it is a draft (`onboarded` false), so nothing is lost when
	 * the person leaves; the last step saves it with `onboarded` true, which opens the profile.
	 */
	async save(data: ProfileAnswers, onboarded: boolean): Promise<void> {
		const user = await this._auth.whenReady();
		const db = await this._firebase.firestore();

		if (!user || !db) throw new Error('Sign in first.');

		const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');

		await setDoc(doc(db, 'edudb_profiles', user.uid), {
			...data,
			onboarded,
			updatedAt: serverTimestamp(),
		});

		const saved: PersonProfile = { ...data, onboarded };

		this._uid = user.uid;
		this._loading = Promise.resolve(saved);
		this.profile.set(saved);
	}

	private _reset(uid: string) {
		this._uid = uid;
		this._loading = null;
		this.profile.set(undefined);
	}

	/** Throws when the profile could not be read; `null` only means there is none. */
	private async _fetch(uid: string): Promise<PersonProfile | null> {
		const db = await this._firebase.firestore();
		let value: PersonProfile | null = null;

		if (db) {
			const { doc, getDoc } = await import('firebase/firestore');
			const snapshot = await getDoc(doc(db, 'edudb_profiles', uid));

			value = snapshot.exists() ? (snapshot.data() as PersonProfile) : null;
		}

		// the person may have signed out or switched accounts while it was read
		if (this._uid === uid) this.profile.set(value);

		return value;
	}
}
