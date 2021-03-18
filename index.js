const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliaSearch = require('algoliasearch');
const algoliaKeys = require('./keys/algolia');
const firebaseUtils = require('./utils/firebase');
const algoliaUtils = require('./utils/algolia');

// Initializing firebase admin.
admin.initializeApp();

// Initializing algolia client.
const algoliaClient = algoliaSearch(
  algoliaKeys.applicationId,
  algoliaKeys.adminKey
);

/**
 * Sync newly added data with Algolia to enable searching
 * on the main app itself.
 */
exports.onQuestionCreated = functions.firestore
  .document('questions/{questionId}')
  .onCreate((snapshot, context) => {
    const question = snapshot.data();
    const questionId = snapshot.id;

    // Preparing object to be stored on algolia.
    const algoliaQuestion = {
      objectID: questionId,
      question: question.question,
      description: question.description,
      categories: question.categories,
    };

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.indexName);

    // Saving the object.
    return index.saveObject(algoliaQuestion);
  });

/**
 * Sync any changes made to any previously existing question
 * with Algolia.
 */
exports.onQuestionUpdated = functions.firestore
  .document('questions/{questionId}')
  .onUpdate((change, context) => {
    const updatedQuestion = change.after.data();
    const questionId = change.before.id;

    // Preparing object to be stored on algolia.
    const algoliaQuestion = {
      objectID: questionId,
      question: updatedQuestion.question,
      description: updatedQuestion.description,
      categories: updatedQuestion.categories,
    };

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.indexName);

    // Saving the object.
    return index.saveObject(algoliaQuestion);
  });

/**
 * When a product is deleted from firebase, delete
 * it from Algolia as well
 */
exports.onQuestionDeleted = functions.firestore
  .document('questions/{questionId}')
  .onDelete((snapshot, context) => {
    const deletedQuestionId = snapshot.id;

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.indexName);

    // Saving the object.
    return index.deleteObject(deletedQuestionId);
  });

/**
 * Sync newly added data with Algolia to enable searching
 * on the main app itself.
 */
exports.onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate((snapshot, context) => {
    const user = snapshot.data();
    const userId = snapshot.id;

    // Preparing object to be stored on algolia.
    const algoliaUser = {
      objectID: userId,
      displayName: user.displayName,
    };

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.userIndexName);

    // Saving the object.
    return index.saveObject(algoliaUser);
  });

/**
 * Sync any changes made to any previously existing question
 * with Algolia.
 */
exports.onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const updatedUser = change.after.data();
    const userId = change.before.id;

    // Preparing object to be stored on algolia.
    const algoliaUser = {
      objectID: userId,
      displayName: updatedUser.displayName,
    };

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.userIndexName);

    // Saving the object.
    return index.saveObject(algoliaUser);
  });

/**
 * When a product is deleted from firebase, delete
 * it from Algolia as well
 */
exports.onUserDeleted = functions.firestore
  .document('users/{userId}')
  .onDelete((snapshot, context) => {
    const deletedUserId = snapshot.id;

    // Preparing algolia index.
    const index = algoliaClient.initIndex(algoliaKeys.userIndexName);

    // Saving the object.
    return index.deleteObject(deletedUserId);
  });

/**
 * Actual searching mechanism for user. First query the algolia database
 * for ids and run it through firestore to get the actual data.
 */
exports.searchForUsers = functions.https.onRequest(async (req, res) => {
  // Getting the search query
  const searchQuery = req.query.searchQuery;

  // Initializing Algolia.
  const index = algoliaClient.initIndex(algoliaKeys.userIndexName);

  // Searching across Algolia database.
  const search = (await index.search(searchQuery)).hits;

  // Getting specific ids to fetch from firestore.
  const objectIds = search.map((result) => result.objectID);

  // If search results are empty, return an empty array.
  if (objectIds.length === 0) {
    res.send([]);
  }

  // Fetching documents from firestore.
  const searchResult = await firebaseUtils.getFirestoreDocsById(
    objectIds,
    'users'
  );

  // Sending the data to client.
  res.send(searchResult);
});

/**
 * Actual searching mechanism for question. First query the algolia database
 * for ids and run it through firestore to get the actual data.
 */
exports.searchForQuestions = functions.https.onRequest(async (req, res) => {
  // Getting the search query
  const searchQuery = req.query.searchQuery;

  // Initializing Algolia.
  const index = algoliaClient.initIndex(algoliaKeys.indexName);

  // Searching across Algolia database.
  const search = (await index.search(searchQuery)).hits;

  // Getting specific ids to fetch from firestore.
  const objectIds = search.map((result) => result.objectID);

  // If search results are empty, return an empty array.
  if (objectIds.length === 0) {
    res.send([]);
  }

  // Fetching documents from firestore.
  const searchResult = await firebaseUtils.getFirestoreDocsById(
    objectIds,
    'questions'
  );

  // Sending the data to client.
  res.send(searchResult);
});

/**
 * Searching and filtering by categories
 */
exports.searchForQuestionsByCategories = functions.https.onRequest(
  async (req, res) => {
    // Getting the search query and categories.
    const searchQuery = req.query.searchQuery;
    const categories = req.query.categories;

    // Initializing Algolia.
    const index = algoliaClient.initIndex(algoliaKeys.indexName);

    // Searching across Algolia database.
    const search = (
      await index.search(searchQuery, {
        filters: algoliaUtils.generateCategoryQuery('categories', categories),
      })
    ).hits;

    // Getting specific ids to fetch from firestore.
    const objectIds = search.map((result) => result.objectID);

    // If search results are empty, return an empty array.
    if (objectIds.length === 0) {
      res.send([]);
    }

    // Fetching documents from firestore.
    const searchResult = await firebaseUtils.getFirestoreDocsById(
      objectIds,
      'questions'
    );

    // Sending the data to client.
    res.send(searchResult);
  }
);
