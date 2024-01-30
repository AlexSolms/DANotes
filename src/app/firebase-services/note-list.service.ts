import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { query, orderBy, limit, Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, where  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes

  firestore: Firestore = inject(Firestore);


  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
  }

  async deleteNote(colId: "notes" | "trash", docId: string){
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
(err) => { console.log(err); }
    );
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIDFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.log(err); }
      );
    };

  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }


  getColIDFromNote(note: Note) {
    return (note.type == 'note') ? 'notes' : 'trash';
  }

  async addNote(item: Note, colId: "notes" | "trash") { //colId: "notes" | "trash"
    let getRef = (colId == 'notes')? this.getNotesRef() : this.getTrashRef();
    await addDoc(getRef, item).catch(
      (err) => { console.error(err) }
    ).then(
      (docRef) => { console.log("Document written with ID: ", docRef?.id) }
    );
    ;
  }


  ngOnDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(),where('marked','==',true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);

  }

}
