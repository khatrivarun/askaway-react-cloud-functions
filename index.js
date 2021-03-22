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
      userId: userId,
      answersPicked: user.answersPicked,
      displayName: user.displayName,
      emailAddress: user.emailAddress,
      followers: user.followers,
      following: user.following,
      photoUrl: user.photoUrl,
      questionsAnswered: user.questionsAnswered,
      questionsAsked: user.questionsAsked,
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
      userId: userId,
      answersPicked: updatedUser.answersPicked,
      displayName: updatedUser.displayName,
      emailAddress: updatedUser.emailAddress,
      followers: updatedUser.followers,
      following: updatedUser.following,
      photoUrl: updatedUser.photoUrl,
      questionsAnswered: updatedUser.questionsAnswered,
      questionsAsked: updatedUser.questionsAsked,
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
