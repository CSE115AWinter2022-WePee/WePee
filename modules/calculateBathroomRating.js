// calculate rating of a bathroom
export const calculateBathroomRating = function (arrayOfReviews) {
  if (!arrayOfReviews) {
    return 5
  }
  let totalSum = 0
  let numRatings = 0
  for (let i = 0; i < arrayOfReviews.length; i++) {
    totalSum += (i + 1) * arrayOfReviews[i]
    numRatings += arrayOfReviews[i]
  }
  return [(totalSum > 0 ? Number((totalSum / numRatings).toFixed(1)) : 0), numRatings]
}
