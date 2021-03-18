const admin = require('firebase-admin');

exports.getFirestoreDocsById = async (ids, collection) => {
  const firebaseDb = admin.firestore();
  const firestoreDocs = [];

  for (const id of ids) {
    const firestoreDoc = await firebaseDb.collection(collection).doc(id).get();

    firestoreDocs.push(firestoreDoc.data());
  }

  return firestoreDocs;
};
