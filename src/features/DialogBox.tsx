import { useEffect, useState } from "react"
import { CgSpinner } from "react-icons/cg"

import type { ProblemData } from "~content"

type Props = {
  showDialogBox: boolean
  lockIn: () => void
  pass: () => void
  problemData: ProblemData
}

export default function DialogBox({
  showDialogBox,
  lockIn,
  pass,
  problemData
}: Props) {
  const [problemDataLoaded, setProblemDataLoaded] = useState<boolean>(false)

  const getProblemDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "hard":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  useEffect(() => {
    console.log(problemData)
    if (problemData.title !== "") {
      setProblemDataLoaded(true)
    }
  }, [problemData])

  return (
    <div
      className={`${showDialogBox ? "block" : "hidden"} bg-black p-4 rounded-md z-[1000] fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-y-4 w-[48rem]`}>
      {problemDataLoaded ? (
        <>
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">{problemData.title}</p>

            <p
              className={`text-xs font-bold ${getProblemDifficultyColor(problemData.difficulty.toLowerCase())}`}>
              {problemData.difficulty}
            </p>

            <div className="text-xs space-y-4">
              <p>
                You're about to use AlgoQuest to track your coding progress and
                enhance your skills. Here's what you need to know:
              </p>
              <ul className="space-y-2">
                <li>
                  A timer will begin to measure how long you take to solve
                  problems.
                </li>
                <li>
                  Tabs like <strong className="text-red-500">Editorial</strong>,{" "}
                  <strong className="text-red-500">Solutions</strong>,{" "}
                  <strong className="text-red-500">Past Submissions</strong>,{" "}
                  <strong className="text-red-500">Hints</strong>, and{" "}
                  <strong className="text-red-500">Discussion</strong> will be
                  disabled to help you stay focused and resist the urge to check
                  solutions.
                </li>
                <li>
                  <strong className="text-green-500">Questbot</strong> will be
                  available to provide hints, but no additional assistance will
                  be accessible.
                </li>
              </ul>
              <p>You have two options:</p>
              <ol>
                <li>
                  <strong className="text-green-500">Accept:</strong> Your
                  progress and timing will be tracked, creating a focused
                  environment to improve your problem-solving skills.
                </li>
                <li>
                  <strong className="text-red-500">Decline:</strong> Your
                  progress won't be tracked, and no restrictions will apply.
                </li>
              </ol>
              <p>Do you agree to these terms?</p>
            </div>
          </div>

          <div className="flex-1 flex-row space-x-4 justify-center">
            <button
              className="w-1/4 px-4 py-2 border-2 border-green-500 hover:border-green-700 bg-green-500 hover:bg-green-700 rounded-md transition-all"
              onClick={() => lockIn()}>
              Accept
            </button>

            <button
              className="w-1/4 px-4 py-2 border-2 border-red-500 hover:bg-red-500 rounded-md transition-all"
              onClick={() => pass()}>
              Decline
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center m-16">
          <CgSpinner size={24} className="animate-spin" />
        </div>
      )}
    </div>
  )
}
