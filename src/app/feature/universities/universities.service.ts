import { inject, Service, signal } from '@angular/core';
import type { University } from '../edudb/edudb.models';
import { freeSlug } from '../edudb/slug';
import { FirebaseService } from '../firebase/firebase.service';

/** The universities (Firestore: edudb_universities), a list an admin keeps. */
@Service()
export class UniversitiesService {
	private readonly _firebase = inject(FirebaseService);

	readonly universities = signal<University[]>([]);
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
	 * Admin: creates the university or updates it. The slug is the document id. A new university whose slug is
	 * taken gets the next free one (`kpi-2`). Returns the slug it was saved under.
	 */
	async save(university: University, create = false): Promise<string> {
		const db = await this._firebase.firestore();

		if (!db) return university.slug;

		const { doc, getDoc, serverTimestamp, setDoc } = await import('firebase/firestore');
		const slug = create
			? await freeSlug(university.slug, async (candidate) =>
					(await getDoc(doc(db, 'edudb_universities', candidate))).exists(),
				)
			: university.slug;

		await setDoc(doc(db, 'edudb_universities', slug), {
			name: university.name,
			city: university.city,
			updatedAt: serverTimestamp(),
		});
		await this.reload();

		return slug;
	}

	/** Admin: removes the university. */
	async remove(slug: string): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		const { deleteDoc, doc } = await import('firebase/firestore');

		await deleteDoc(doc(db, 'edudb_universities', slug));
		await this.reload();
	}

	private async _fetch(): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		try {
			const { collection, getDocs } = await import('firebase/firestore');
			const snapshot = await getDocs(collection(db, 'edudb_universities'));

			this.universities.set(
				snapshot.docs
					.map((item) => ({
						...(item.data() as Omit<University, 'slug'>),
						slug: item.id,
					}))
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
