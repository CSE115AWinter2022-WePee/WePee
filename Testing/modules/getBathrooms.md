# Test for modules/calculateBathroomRating.js

## Input format
The function in this file, `calculateBathroomRating`, expects an array of 5 non-negative integers. The 0th element of this array corresponds to how many 1 star ratings this bathroom has, the 1st element corresponds to how many 2 star ratings, and so forth, with the 4th element representing how many 5 star ratings the bathroom has. At least one element of the array is guaranteed to be greater than zero (so computing the weighted average is always well-defined).

## Expected Output
The function should return the average rating as a floating-point number. For example, a review input array of `[1, 2, 3, 4, 5]` should return `(1 * 1 + 2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)/(1 + 2 + 3 + 4 + 5) = 3.67` because that is the average rating.

## Edge Cases
One edge case is present: the case if the review array is undefined, an empty array, or some other falsey value such as null. In this case, just return 5 stars. This is to ensure if for old entries in the database that may not have this review format, it will still return some value and not error.

## Equivalence Classes
There are 2 equivalence classes: one if bathroom array is falsey, and one if it has 5 non-negative values and at least one element is positive. 

## Test Cases
### Bathroom array is falsey
```assert calculateBathroomRating([]) === 5```

### Bathroom has 5 non-negative values and at least one element is positive
```assert calculateBathroomRating([1, 2, 3, 4, 5]) === 3.67```
```assert calculateBathroomRating([0, 0, 1, 0, 0]) === 3```