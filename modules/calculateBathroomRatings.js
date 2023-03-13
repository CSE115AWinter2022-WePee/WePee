// calculate rating of a bathroom
export const calculateBathroomRating = function (data) {
    if (!data) {
      return 5
    }
    let totalSum = 0
    let numRatings = 0
    for (let i = 0; i < data.rating.length; i++) {
      totalSum += (i + 1) * data.rating[i]
      numRatings += data.rating[i]
    }
    return [(totalSum > 0 ? Number((totalSum / numRatings).toFixed(1)) : 0), numRatings]
  }