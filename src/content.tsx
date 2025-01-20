import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import Console from "~components/Console"
import DialogBox from "~components/DialogBox"
import Overlay from "~components/Overlay"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  // Common state that will be shared by dialogbox and console to show/hide overlay
  const [showOverlay, setShowOverlay] = useState<boolean>(true)
  const [showConsole, setShowConsole] = useState<boolean>(false)
  const [showDialogBox, setShowDialogBox] = useState<boolean>(true)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true)
  const [isSolutionAccepted, setIsSolutionAccepted] = useState<boolean>(false)

  // If the user chooses to start the timer, and lock all the solutions
  const lockIn = () => {
    setShowDialogBox(false)
    setShowOverlay(false)
    setShowConsole(true)
  }

  // If the user chooses not to start the timer, don't lock all the solutions
  const pass = () => {
    setShowDialogBox(false)
    setShowOverlay(false)
  }

  // Toggle timer
  const toggleTimer = () => {
    setIsTimerRunning((prevState) => !prevState)
    setShowOverlay((prevState) => !prevState)
  }

  // Timer Effect
  useEffect(() => {
    // Update timer every 100ms to avoid the on/off flicker glitch
    const intervalId = setInterval(
      () => isTimerRunning && setTimeElapsed((prevTime) => prevTime + 1),
      100
    )

    return () => clearInterval(intervalId) // Cleanup interval on unmount
  }, [isTimerRunning])

  const handleAccepted = () => {
    setIsSolutionAccepted(true)
    setIsTimerRunning(false)
  }

  // Check if the solution is submitted
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const highchartsRoot = document.querySelector(".highcharts-root")
          if (highchartsRoot) {
            // console.log("Highcharts root element added to the document")
            handleAccepted()
            observer.disconnect()
            break
          }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [timeElapsed])

  // Temporary solution to edit the console
  useEffect(() => lockIn(), [])

  return (
    <>
      <Overlay showOverlay={showOverlay} />
      {showConsole && (
        <Console
          isTimerRunning={isTimerRunning}
          timeElapsed={timeElapsed}
          isSolutionAccepted={isSolutionAccepted}
          toggleTimer={toggleTimer}
        />
      )}
      {showDialogBox && (
        <DialogBox showDialogBox={showDialogBox} lockIn={lockIn} pass={pass} />
      )}
    </>
  )
}

export default PlasmoOverlay
