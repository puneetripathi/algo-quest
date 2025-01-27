import { useEffect, useState } from "react"
import {
  FaCircleCheck,
  FaRegCirclePause,
  FaRegCirclePlay,
  FaWandMagic,
  FaWandMagicSparkles
} from "react-icons/fa6"
import { HiSparkles } from "react-icons/hi"
import { MdDragHandle } from "react-icons/md"

import { Storage } from "@plasmohq/storage"

type Props = {
  timeElapsed: number
  isTimerRunning: boolean
  isSolutionAccepted: boolean
  toggleTimer: () => void
  bestTime: number
}

export default function Console({
  timeElapsed,
  isTimerRunning,
  isSolutionAccepted,
  toggleTimer,
  bestTime
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
      className="fixed p-5 bg-black rounded-md z-[1000] space-y-2">
      <MdDragHandle
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing"
      />

      <div className="flex flex-row justify-center items-center space-x-2 text-white">
        {isSolutionAccepted ? (
          <FaCircleCheck className="text-green-500" size={18} />
        ) : isTimerRunning ? (
          <FaRegCirclePause
            className="text-yellow-500 cursor-pointer"
            size={18}
            onClick={() => toggleTimer()}
          />
        ) : (
          <FaRegCirclePlay
            className="text-green-500 cursor-pointer"
            size={18}
            onClick={() => toggleTimer()}
          />
        )}

        <p className="select-none">{formatTime(timeElapsed)}</p>
      </div>

      <div className="flex justify-center items-center">
        <p className="text-xs text-gray-500">
          Best time: {bestTime > 0 ? formatTime(bestTime) : "N/A"}
        </p>
      </div>
    </div>
  )
}
