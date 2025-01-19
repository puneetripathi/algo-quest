import { useState } from "react"

type Props = {
  showDialogBox: boolean
  lockIn: () => void
  pass: () => void
}

export default function DialogBox({ showDialogBox, lockIn, pass }: Props) {
  return (
    <div
      className={`${showDialogBox ? "plasmo-block" : "plasmo-hidden"} plasmo-bg-black plasmo-p-4 plasmo-rounded-md plasmo-z-[1000] plasmo-fixed plasmo-left-1/2 plasmo-top-1/2 plasmo-transform -plasmo-translate-x-1/2 -plasmo-translate-y-1/2 plasmo-text-center plasmo-space-y-4 plasmo-w-1/2`}>
      <div className="plasmo-text-center plasmo-space-y-2">
        <p className="plasmo-text-3xl plasmo-font-bold">Question name</p>
        <p className="plasmo-text-xs">Easy/Medium/Hard</p>
      </div>

      <div className="plasmo-flex-1 plasmo-flex-row plasmo-space-x-4 plasmo-justify-center">
        <button
          className="plasmo-w-1/4 plasmo-px-4 plasmo-py-2 plasmo-border-2 plasmo-border-green-500 hover:plasmo-border-green-700 plasmo-bg-green-500 hover:plasmo-bg-green-700 plasmo-rounded-md plasmo-transition-all"
          onClick={() => lockIn()}>
          Yes, let's lock in
        </button>

        <button
          className="plasmo-w-1/4 plasmo-px-4 plasmo-py-2 plasmo-border-2 plasmo-border-red-500 hover:plasmo-bg-red-500 plasmo-rounded-md plasmo-transition-all"
          onClick={() => pass()}>
          Nah, I'll pass
        </button>
      </div>
    </div>
  )
}
