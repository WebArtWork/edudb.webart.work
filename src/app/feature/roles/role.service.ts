import { computed, inject, Service, signal } from '@angular/core';
import type { User } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import type { Role, TeacherRequest } from '../edudb/edudb.models';
import { FirebaseService } from '../firebase/firebase.service';
import { SchoolsService } from '../schools/schools.service';

/**
 * The role of the signed-in person. Admins are listed by email (the Firestore rules hold the same list);
 * a teacher is a user whose request to become a teacher was approved. Everyone else is a user.
 */
@Service()
export class RoleService {
	private readonly _auth = inject(AuthService);
	private readonly _firebase = inject(FirebaseService);
	private readonly _schools = inject(SchoolsService);

	/** The request as read, with whose it is, so a sign-in as someone else never shows the last person's. */
	private readonly _request = signal<{ uid: string; value: TeacherRequest | null } | undefined>(
		undefined,
	);
	/** The person's own teacher request: `undefined` until loaded, `null` when there is none. */
	readonly request = computed<TeacherRequest | null | undefined>(() => {
		const read = this._request();

		return read && read.uid === this._auth.user()?.uid ? read.value : undefined;
	});
	readonly role = computed<Role | null>(() => {
		const user = this._auth.user();

		if (!user) return null;
		if (this.isAdmin(user)) return 'admin';

		return this.request()?.status === 'approved' ? 'teacher' : 'user';
	});

	/**
	 * The school the person runs, or `undefined`. An admin sets it on the school (`directorUid`), so a person
	 * can be a director and a teacher at once. Needs the schools to be loaded.
	 */
	readonly directorSchool = computed(() => {
		const uid = this._auth.user()?.uid;

		return uid
			? this._schools.schools().find((school) => school.directorUid === uid)
			: undefined;
	});

	isAdmin(user: User | null | undefined): boolean {
		return (
			!!user?.emailVerified &&
			!!user.email &&
			environment.adminEmails.includes(user.email.toLowerCase())
		);
	}

	/** Reads the person's own request (the teacher role depends on it). */
	async loadRequest(): Promise<void> {
		const user = await this._auth.whenReady();
		const db = await this._firebase.firestore();

		if (!user || !db) {
			this._request.set(user ? { uid: user.uid, value: null } : undefined);

			return;
		}

		const { doc, getDoc } = await import('firebase/firestore');
		const snapshot = await getDoc(doc(db, 'edudb_teacherRequests', user.uid));

		this._request.set({
			uid: user.uid,
			value: snapshot.exists()
				? ({ ...snapshot.data(), uid: user.uid } as TeacherRequest)
				: null,
		});
	}

	/** Asks to become a teacher. An admin sees the request on the Access page. */
	async requestTeacher(): Promise<void> {
		const user = await this._auth.whenReady();
		const db = await this._firebase.firestore();

		if (!user || !db) throw new Error('Sign in first.');

		const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');

		await setDoc(doc(db, 'edudb_teacherRequests', user.uid), {
			displayName: user.displayName ?? '',
			email: user.email ?? '',
			photoUrl: user.photoURL ?? '',
			status: 'pending',
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		await this.loadRequest();
	}
}
