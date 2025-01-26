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
        return "plasmo-text-green-500"
      case "medium":
        return "plasmo-text-yellow-500"
      case "hard":
        return "plasmo-text-red-500"
      default:
        return "plasmo-text-gray-500"
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
      className={`${showDialogBox ? "plasmo-block" : "plasmo-hidden"} plasmo-bg-black plasmo-p-4 plasmo-rounded-md plasmo-z-[1000] plasmo-fixed plasmo-left-1/2 plasmo-top-1/2 plasmo-transform -plasmo-translate-x-1/2 -plasmo-translate-y-1/2 plasmo-text-center plasmo-space-y-4 plasmo-w-[48rem]`}>
      {problemDataLoaded ? (
        <>
          <div className="plasmo-text-center plasmo-space-y-2">
            <p className="plasmo-text-3xl plasmo-font-bold">
              {problemData.title}
            </p>

            <p
              className={`plasmo-text-xs plasmo-font-bold ${getProblemDifficultyColor(problemData.difficulty.toLowerCase())}`}>
              {problemData.difficulty}
            </p>

            <div className="plasmo-text-xs plasmo-space-y-4">
              <p>
                You're about to use AlgoQuest to track your coding progress and
                enhance your skills. Here's what you need to know:
              </p>
              <ul className="plasmo-space-y-2">
                <li>
                  A timer will begin to measure how long you take to solve
                  problems.
                </li>
                <li>
                  Tabs like{" "}
                  <strong className="plasmo-text-red-500">Editorial</strong>,{" "}
                  <strong className="plasmo-text-red-500">Solutions</strong>,{" "}
                  <strong className="plasmo-text-red-500">
                    Past Submissions
                  </strong>
                  , <strong className="plasmo-text-red-500">Hints</strong>, and{" "}
                  <strong className="plasmo-text-red-500">Discussion</strong>{" "}
                  will be disabled to help you stay focused and resist the urge
                  to check solutions.
                </li>
                <li>
                  <strong className="plasmo-text-green-500">Questbot</strong>{" "}
                  will be available to provide hints, but no additional
                  assistance will be accessible.
                </li>
              </ul>
              <p>You have two options:</p>
              <ol>
                <li>
                  <strong className="plasmo-text-green-500">Accept:</strong>{" "}
                  Your progress and timing will be tracked, creating a focused
                  environment to improve your problem-solving skills.
                </li>
                <li>
                  <strong className="plasmo-text-red-500">Decline:</strong> Your
                  progress won't be tracked, and no restrictions will apply.
                </li>
              </ol>
              <p>Do you agree to these terms?</p>
            </div>
          </div>

          <div className="plasmo-flex-1 plasmo-flex-row plasmo-space-x-4 plasmo-justify-center">
            <button
              className="plasmo-w-1/4 plasmo-px-4 plasmo-py-2 plasmo-border-2 plasmo-border-green-500 hover:plasmo-border-green-700 plasmo-bg-green-500 hover:plasmo-bg-green-700 plasmo-rounded-md plasmo-transition-all"
              onClick={() => lockIn()}>
              Accept
            </button>

            <button
              className="plasmo-w-1/4 plasmo-px-4 plasmo-py-2 plasmo-border-2 plasmo-border-red-500 hover:plasmo-bg-red-500 plasmo-rounded-md plasmo-transition-all"
              onClick={() => pass()}>
              Decline
            </button>
          </div>
        </>
      ) : (
        <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-m-16">
          <CgSpinner size={24} className="plasmo-animate-spin" />
        </div>
      )}
    </div>
  )
}
