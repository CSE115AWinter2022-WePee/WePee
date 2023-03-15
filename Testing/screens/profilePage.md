# Tests for screens/profilePage.js
## `cleanupAndSetFirebaseUserReviews`
This function cleans up the data from the database and fills in any missing data.
### Input
`junkyArray` - a list of firebase documents.
### Output
Returns a stripped down array of documents with metadata and other useless info removed.
### Equivalence Classes
There are two equivalence classes: if the list of documents has an element without a name or all the documents have name.
### Tests
#### List of documents has element without name
```
docs = fetch all reviews for this user from db
bathroom_name = pop the bathroom_name from docs[0]
cleanupAndSetFirebaseUserReviews(docs)
assert docs[0].name === bathroom_name
```
#### List of documents has all elements with name
```
docs = fetch all reviews for this user from db
bathroom_name = docs[0].bathroom_name
cleanupAndSetFirebaseUserReviews(docs)
assert docs[0].name === bathroom_name
```
