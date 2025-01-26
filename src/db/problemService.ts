import db from "./connection"

export type ProblemSchema = {
  name: string
  difficulty: string
  tags: string[]
  link: string
  best_time: number
}

// Add or update problem based on link and best time
export const updateProblemByLink = async (problemData: ProblemSchema) => {
  if (problemData.name === "") return

  const existingProblem = await db.problems
    .where("link")
    .equals(problemData.link)
    .first()

  if (existingProblem) {
    const prevBestTime = existingProblem.best_time

    // If the previous time is greater i.e. previously took longer time then update the problem otherwise leave it be
    if (prevBestTime > problemData.best_time) {
      return await db.problems.update(existingProblem.id, problemData)
    }
  } else {
    return await db.problems.add(problemData)
  }
}

// Get problem based on the link
export const getProblemByLink = async (problemLink: string) => {
  if (problemLink === "") return

  console.log(problemLink)

  const existingProblem = await db.problems
    .where("link")
    .equals(problemLink)
    .first()

  if (existingProblem) return existingProblem
  else return null
}

// // Get all users
// export const getAllProblems = async () => {
//   return await db.users.toArray()
// }

// // Get a user by ID
// export const getProblemById = async (id) => {
//   return await db.users.get(id)
// }

// // Update a user by ID
// export const updateUse = async (id, updatedFields) => {
//   return await db.users.update(id, updatedFields)
// }

// // Delete a user by ID
// export const deleteUser = async (id) => {
//   return await db.users.delete(id)
// }
