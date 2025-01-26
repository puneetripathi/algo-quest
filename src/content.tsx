import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useLayoutEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import ChatSidebar from "~components/ChatSidebar"
import Console from "~components/Console"
import DialogBox from "~components/DialogBox"
import Overlay from "~components/Overlay"
import { exportBackup } from "~db/backup"
import {
  getProblemByLink,
  updateProblemByLink,
  type ProblemSchema
} from "~db/problemService"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export type ProblemData = {
  title: string
  description: string
  difficulty: string
  tags: string[]
}

const PlasmoOverlay = () => {
  const storage = new Storage()

  // Common state that will be shared by dialogbox and console to show/hide overlay
  const [showOverlay, setShowOverlay] = useState<boolean>(true)
  const [showConsole, setShowConsole] = useState<boolean>(false)
  const [showDialogBox, setShowDialogBox] = useState<boolean>(true)
  const [bestTime, setBestTime] = useState<number>(0)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)
  const [isSolutionAccepted, setIsSolutionAccepted] = useState<boolean>(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false)
  const [problemLink, setProblemLink] = useState<string>("")
  const [problemData, setProblemData] = useState<ProblemData>({
    title: "",
    description: "",
    difficulty: "",
    tags: []
  })

  const [userSolution, setUserSolution] = useState<string>("")

  // Check if backup is created or not
  useEffect(() => {
    const checkForBackup = async () => {
      // Retrieve the last backup time from storage
      const lastBackupTime = await storage.getItem("LAST_BACKUP_TIME")

      // Check if lastBackupTime is valid and if it's more than 24 hours ago
      if (
        lastBackupTime &&
        new Date() - new Date(lastBackupTime) > 24 * 60 * 60 * 1000
      ) {
        console.log("Exceeded backup time interval")
        storage.setItem("LAST_BACKUP_TIME", new Date())
        exportBackup()
      } else if (lastBackupTime) {
        console.log("Backup was recently performed")
      } else {
        // If no backup time is found, perform the backup and set the time
        console.log("No previous backup timing found")
        storage.setItem("LAST_BACKUP_TIME", new Date())
        exportBackup()
      }
    }

    checkForBackup()
  }, [])

  // If the user chooses to start the timer, and lock all the solutions
  const lockIn = () => {
    setShowDialogBox(false)
    setShowOverlay(false)
    setShowConsole(true)
    setIsTimerRunning(true)
    toggleTabs(false)
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

  useEffect(() => {
    const url = new URL(window.location.href)
    const segments = url.pathname.split("/").filter(Boolean) // Split path into segments
    const truncatedPath = `/${segments.slice(0, 2).join("/")}` // Keep up to `/problems/abcd`
    const truncatedLink = `${url.origin}${truncatedPath}` // Combine origin with truncated path

    // console.log("truncated link " + truncatedLink)
    setProblemLink(truncatedLink)
  }, [])

  const handleAccepted = async () => {
    setIsSolutionAccepted(true)
    setIsTimerRunning(false)
    toggleTabs(true)

    const problem: ProblemSchema = {
      name: problemData.title,
      tags: problemData.tags,
      difficulty: problemData.difficulty,
      best_time: timeElapsed,
      link: problemLink
    }

    const retData = await updateProblemByLink(problem)
    console.log(retData)
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

  // Retrieve best time for current problem if it exists
  useEffect(() => {
    const getBestTime = async () => {
      const retProblem = await getProblemByLink(problemLink)

      if (retProblem) setBestTime(retProblem.best_time)
    }

    getBestTime()
  }, [problemLink])

  // Retrieve problem data
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const titleElement = document.querySelector(
            ".no-underline.hover\\:text-blue-s.dark\\:hover\\:text-dark-blue-s.truncate.cursor-text.whitespace-normal.hover\\:\\!text-\\[inherit\\]"
          )

          const descriptionElement = document.querySelector(".elfjS")

          const difficultyElement =
            document.querySelector(".text-difficulty-medium") ||
            document.querySelector(".text-difficulty-easy") ||
            document.querySelector(".text-difficulty-hard")

          const tagsElement = document
            .querySelector(".mt-2.flex.flex-wrap.gap-1.pl-7")
            .querySelectorAll("a")

          if (
            titleElement ||
            descriptionElement ||
            difficultyElement ||
            tagsElement
          ) {
            // console.log(titleElement?.textContent)
            // console.log(descriptionElement?.textContent)
            // console.log(difficultyElement?.textContent)
            // console.log(tagsElement)

            const tags = Array.from(tagsElement).map((tag) => tag.textContent)

            setProblemData({
              title: titleElement?.textContent || "",
              description: descriptionElement?.textContent || "",
              difficulty: difficultyElement?.textContent || "",
              tags
            })
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
  }, [])

  // Retrieve user solution
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const editor = document.querySelector(".view-lines")
          if (editor) {
            setUserSolution(editor?.textContent)
            // console.log(editor?.textContent)
            // handleAccepted()
            // observer.disconnect()
            // break
          }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Lock all the tabs
  const toggleTabs = (visibility: boolean) => {
    const tabs = document.querySelectorAll(
      ".flexlayout__tab_button.flexlayout__tab_button_top"
    )

    tabs.forEach((tab) => {
      // Tab names are written twice because for some reason their are two divs with the text
      // I cannot query further in because these two are sibling divs and therefore would be
      // to complex to query. So this is a simple hack to select tabs
      if (
        tab.textContent === "EditorialEditorial" ||
        tab.textContent === "SolutionsSolutions" ||
        tab.textContent === "SubmissionsSubmissions"
      ) {
        tab.setAttribute(
          "style",
          visibility ? "display: flex" : "display: none"
        )
      }
    })

    const bottomTabsGroup = document.querySelector(".mt-6.flex.flex-col.gap-3")

    bottomTabsGroup?.setAttribute(
      "style",
      visibility ? "display: flex" : "display: none"
    )
  }

  // Temporary solution to edit the console
  // useEffect(() => lockIn(), [])

  useLayoutEffect(() => {
    // Select all elements with the specified classes
    const elements = document.querySelectorAll(
      ".relative.inline-flex.items-center.justify-center.text-caption.px-2.py-1.gap-1.rounded-full.bg-fill-secondary"
    )

    // Iterate over each matching element
    elements.forEach((element) => {
      // Check if a sibling with the same id already exists to prevent duplicates
      const existingSibling = Array.from(element.parentNode.children).find(
        (child) => child.id === "algoquest-ai-support-btn"
      )
      if (existingSibling) return

      // Create a new element
      const newElement = document.createElement("div")

      newElement.id = "algoquest-ai-support-btn"

      // Add the same classes to the new element
      newElement.className =
        "relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary cursor-pointer"

      // Add the content "AI Support" with the SVG icon
      newElement.innerHTML = `
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
          <path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"></path>
        </svg>
        AI Support
      `

      // Append the new element as a sibling to the current element
      element.parentNode.appendChild(newElement)

      // Add an onclick listener to toggle the ai chat sidebar
      newElement.onclick = () => {
        setIsSidebarVisible(true)
      }
    })
  }, [])

  useEffect(() => console.log(isSidebarVisible), [isSidebarVisible])

  return (
    <>
      <Overlay showOverlay={showOverlay} />

      <ChatSidebar
        isSidebarVisible={isSidebarVisible}
        setIsSidebarVisible={setIsSidebarVisible}
        problemData={problemData}
        userSolution={userSolution}
      />

      {showConsole && (
        <Console
          isTimerRunning={isTimerRunning}
          timeElapsed={timeElapsed}
          isSolutionAccepted={isSolutionAccepted}
          toggleTimer={toggleTimer}
          bestTime={bestTime}
        />
      )}
      {showDialogBox && (
        <DialogBox
          showDialogBox={showDialogBox}
          lockIn={lockIn}
          pass={pass}
          problemData={problemData}
        />
      )}
    </>
  )
}

export default PlasmoOverlay
