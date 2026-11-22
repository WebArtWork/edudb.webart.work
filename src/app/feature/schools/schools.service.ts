import { inject, Service, signal } from '@angular/core';
import type { School, Student } from '../edudb/edudb.models';
import { freeSlug } from '../edudb/slug';
import { FirebaseService } from '../firebase/firebase.service';

/** The schools (Firestore: edudb_schools) and the people who chose them (edudb_users). */
@Service()
export class SchoolsService {
	private readonly _firebase = inject(FirebaseService);

	readonly schools = signal<School[]>([]);
	readonly loaded = signal(false);
	readonly failed = signal(false);

	private _loading: Promise<void> | null = null;

	load(): Promise<void> {
		this._loading ??= this._fetch();

		return this._loading;
	}

	reload(): Promise<void> {
		this._loading = null;

		return this.load();
	}

	/**
	 * Admin: creates the school or updates it. The slug is the document id. A new school whose slug is taken
	 * gets the next free one (`kp-7-2`), so it never overwrites another school. Returns the slug it was saved under.
	 */
	async save(school: School, create = false): Promise<string> {
		const db = await this._firebase.firestore();

		if (!db) return school.slug;

		const { doc, getDoc, serverTimestamp, setDoc } = await import('firebase/firestore');
		const slug = create
			? await freeSlug(school.slug, async (candidate) =>
					(await getDoc(doc(db, 'edudb_schools', candidate))).exists(),
				)
			: school.slug;

		await setDoc(doc(db, 'edudb_schools', slug), {
			name: school.name,
			city: school.city,
			description: school.description,
			...(school.directorUid ? { directorUid: school.directorUid } : {}),
			updatedAt: serverTimestamp(),
		});
		await this.reload();

		return slug;
	}

	/** Admin: removes the school, and takes the people who chose it off it, so none of them points at nothing. */
	async remove(slug: string): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		const { collection, deleteDoc, doc, getDocs, query, serverTimestamp, where, writeBatch } =
			await import('firebase/firestore');
		const students = await getDocs(
			query(collection(db, 'edudb_users'), where('schoolSlug', '==', slug)),
		);

		// a batch holds at most 500 writes
		for (let start = 0; start < students.docs.length; start += 500) {
			const batch = writeBatch(db);

			for (const student of students.docs.slice(start, start + 500)) {
				batch.update(student.ref, { schoolSlug: '', updatedAt: serverTimestamp() });
			}

			await batch.commit();
		}

		await deleteDoc(doc(db, 'edudb_schools', slug));
		await this.reload();
	}

	/** The people who chose the school, best first. Points are written by the apps. */
	async students(slug: string): Promise<Student[]> {
		const db = await this._firebase.firestore();

		if (!db) return [];

		const { collection, getDocs, query, where } = await import('firebase/firestore');
		const snapshot = await getDocs(
			query(collection(db, 'edudb_users'), where('schoolSlug', '==', slug)),
		);

		return snapshot.docs
			.map((item) => ({ ...(item.data() as Omit<Student, 'uid'>), uid: item.id }))
			.sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName));
	}

	/** The school the person chose (an empty string when none). */
	async chosen(uid: string): Promise<string> {
		const db = await this._firebase.firestore();

		if (!db) return '';

		const { doc, getDoc } = await import('firebase/firestore');
		const snapshot = await getDoc(doc(db, 'edudb_users', uid));

		return snapshot.exists() ? ((snapshot.data()['schoolSlug'] as string) ?? '') : '';
	}

	/** The person chooses a school; their name and photo then show on its page. Points stay as they are. */
	async choose(
		user: { uid: string; displayName: string | null; photoURL: string | null },
		schoolSlug: string,
		minor = false,
	): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		const { doc, getDoc, serverTimestamp, setDoc } = await import('firebase/firestore');
		const reference = doc(db, 'edudb_users', user.uid);
		const existing = await getDoc(reference);

		await setDoc(reference, {
			// the school page is public: under 18 shows the first name only, without the photo
			displayName: minor ? (user.displayName ?? '').split(' ')[0] : (user.displayName ?? ''),
			photoUrl: minor ? '' : (user.photoURL ?? ''),
			schoolSlug,
			points: existing.exists() ? (existing.data()['points'] ?? 0) : 0,
			updatedAt: serverTimestamp(),
		});
	}

	private async _fetch(): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		try {
			const { collection, getDocs } = await import('firebase/firestore');
			const snapshot = await getDocs(collection(db, 'edudb_schools'));

			this.schools.set(
				snapshot.docs
					.map((item) => ({ ...(item.data() as Omit<School, 'slug'>), slug: item.id }))
					.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
			);
			this.failed.set(false);
		} catch {
			this.failed.set(true);
			// the next load tries again
			this._loading = null;
		} finally {
			this.loaded.set(true);
		}
	}
}
