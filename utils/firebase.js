const admin = require('firebase-admin');

exports.getFirestoreDocsById = async (ids, collection) => {
  const firebaseDb = admin.firestore();
  const firestoreDocs = [];

  await Promise.all(
    ids.forEach(async (id) => {
      const firestoreDoc = await firebaseDb
        .collection(collection)
        .doc(id)
        .get();

      firestoreDocs.push(firestoreDoc.data());
    })
  );

  return firestoreDocs;
};
