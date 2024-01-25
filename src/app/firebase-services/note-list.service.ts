import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  items$;
  items;

  unsubList;


  firestore: Firestore = inject(Firestore);
  constructor() {
    this.unsubList = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach(element => {
        console.log(element.ref);
      });
    });




    this.items$ = collectionData(this.getNotesRef());
    this.items = this.items$.subscribe((list) => {
      list.forEach(element => {
        console.log(element);
      });
    });

  }

  ngonDestroy() {
    this.unsubList();
    this.items.unsubscribe();
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getSingleDocRef(collId: string, docId: string) {
    return doc(collection(this.firestore, collId), docId);

  }
}
