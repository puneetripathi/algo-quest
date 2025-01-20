import { useEffect, useState } from "react"
import {
  FaCircleCheck,
  FaRegCirclePause,
  FaRegCirclePlay
} from "react-icons/fa6"
import { MdDragHandle } from "react-icons/md"

import { Storage } from "@plasmohq/storage"

type Props = {
  timeElapsed: number
  isTimerRunning: boolean
  isSolutionAccepted: boolean
  toggleTimer: () => void
}

export default function Console({
  timeElapsed,
  isTimerRunning,
  isSolutionAccepted,
  toggleTimer
}: Props) {
  const storage = new Storage()

  // Initial position of console within the viewport, which is by default not visible until later on updated
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: -9999,
    y: 20
  })

  // Loads the position of the console from the local storage or else uses a default position which is in the center of the viewport
  useEffect(() => {
    storage.get("position").then((position) => {
      if (typeof position === "string") {
        setPosition(
          JSON.parse(position) || { x: window.innerWidth / 2 - 64, y: 48 }
        )
      } else {
        setPosition(position || { x: window.innerWidth / 2 - 64, y: 48 })
      }
    })
  }, [])

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  })

  // Converts time in milliseconds to HH:MM:SS format
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 36000) // Convert to hours (1 hour = 36000 * 10 ms)
    const minutes = Math.floor((time % 36000) / 600) // Convert to minutes (1 min = 600 * 10 ms)
    const seconds = Math.floor((time % 600) / 10) // Convert to seconds (1 sec = 10 * 10 ms)

    return `${hours > 0 ? hours.toString().padStart(2, "0") + ":" : ""}${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // Mouse event handlers for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  // Mouse event handlers for dragging
  const handleMouseUp = () => {
    setIsDragging(false)

    // Update the position of console in the local storage
    setPosition((currentPosition) => {
      storage.set("position", { x: currentPosition.x, y: currentPosition.y })
      return currentPosition
    })
  }

  // Event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      className="plasmo-fixed plasmo-p-5 plasmo-bg-black plasmo-rounded-md plasmo-z-[1000] plasmo-cursor-default">
      <MdDragHandle
        onMouseDown={handleMouseDown}
        className="plasmo-absolute plasmo-top-0 plasmo-left-1/2 plasmo-transform -plasmo-translate-x-1/2 plasmo-cursor-grab active:plasmo-cursor-grabbing"
      />
      <div className="plasmo-flex plasmo-items-center plasmo-space-x-2 plasmo-text-white">
        {isSolutionAccepted ? (
          <FaCircleCheck className="plasmo-text-green-500" size={18} />
        ) : isTimerRunning ? (
          <FaRegCirclePause
            className="plasmo-text-yellow-500 plasmo-cursor-pointer"
            size={18}
            onClick={() => toggleTimer()}
          />
        ) : (
          <FaRegCirclePlay
            className="plasmo-text-green-500 plasmo-cursor-pointer"
            size={18}
            onClick={() => toggleTimer()}
          />
        )}

        <p className="plasmo-select-none">{formatTime(timeElapsed)}</p>
      </div>
    </div>
  )
}
