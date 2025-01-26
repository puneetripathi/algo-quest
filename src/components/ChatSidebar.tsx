import { GoogleGenerativeAI } from "@google/generative-ai"
import { useEffect, useRef, useState } from "react"
import { FaRegPaperPlane, FaRobot } from "react-icons/fa6"
import { IoWarningOutline } from "react-icons/io5"
import { Remark } from "react-remark"
import { ReactTyped } from "react-typed"

import { Storage } from "@plasmohq/storage"

import type { ProblemData } from "~content"

type Props = {
  isSidebarVisible: boolean
  setIsSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>
  problemData: ProblemData
  userSolution: string
}

type ChatMessage = {
  role: "user" | "bot"
  content: string
}

export default function ChatSidebar({
  isSidebarVisible,
  setIsSidebarVisible,
  problemData,
  userSolution
}: Props) {
  const storage = new Storage()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isFetchingResponse, setIsFetchingResponse] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>("")
  const [apiKey, setApiKey] = useState<string>("")

  const chatboxRef = useRef(null)

  // Fetch assistant api from local storage (Note: Make this encrpyted later on)
  useEffect(() => {
    const fetchAPIfromLocalStorage = async () => {
      const key = await storage.getItem("GEMINI_API_KEY")

      setApiKey(key || "")
    }

    fetchAPIfromLocalStorage()
  }, [storage])

  // Update API key
  const handleUpdateAPIKey = async () => {
    const key = prompt("Enter your key")

    storage.setItem("GEMINI_API_KEY", key)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You're an assistant named "QuestBot" that helps users with their coding problems by guiding them in the right direction. You encourage users to think critically and arrive at solutions themselves. You avoid giving complete code solutions, even if explicitly asked, and instead provide hints or suggestions to help them progress. When showing code snippets, only highlight minor issues or specific mistakes, and always encourage the user to identify and resolve the problem on their own.`
  })
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `For context, I am trying to solve the problem "${problemData.title}", whose description is as following:\n${problemData.description}\n`
          }
        ]
      },
      ...messages.map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }]
      }))
    ]
  })

  const handleSendMessage = async (message: string = "") => {
    // If the context or message is given then create a custom message, else use the user input
    console.log(userSolution)
    const prompt = `For context, and if and only if required here is my solution:\n${userSolution}\n\nIf the following message does not reference the code, then dont mention the code at all. Only reference the code if asked or implied in the following message:\n\n${message ? message : userInput}`

    if (!prompt.trim()) return

    // Add user message to the chat window
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message ? message : userInput }
    ])
    setUserInput("") // Clear the input box
    setIsFetchingResponse(true)

    try {
      console.log(prompt)
      const result = await chat.sendMessage(prompt)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: result.response.text() }
      ])
      console.log(result.response.text())
    } catch (error) {
      console.error("Error fetching data from Gemini API:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: "Error fetching response from Gemini" }
      ])
    } finally {
      setIsFetchingResponse(false)
    }
  }

  useEffect(() => {
    const chatbox = chatboxRef.current
    if (chatbox) {
      // Scroll to the absolute bottom every time messages change
      setTimeout(() => {
        chatbox.scrollTo({
          top: chatbox.scrollHeight,
          behavior: "smooth"
        })
      }, 100)
    }
  }, [messages, isFetchingResponse])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // If the Enter key is pressed without Shift, submit the form
      e.preventDefault() // Prevent the default new line behavior
      handleSendMessage() // Call the function to send the message
    }
    // If Shift + Enter is pressed, allow the textarea to expand
    else if (e.key === "Enter" && e.shiftKey) {
      // This allows a new line to be added without submitting
      return
    }
  }

  const handleInput = (e) => {
    const textarea = e.target

    // Reset the height to auto so it shrinks if text is deleted
    textarea.style.height = "auto"

    // Set the height to scrollHeight (which automatically grows with content)
    // Limit the expansion to 10 lines (approx 10 * line-height)
    const maxHeight =
      10 * parseInt(window.getComputedStyle(textarea).lineHeight, 10) // Get line height
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px" // Adjust the height
  }

  return (
    <>
      <div
        onClick={(e) => {
          // Prevents closing the sidebar when clicking on it
          setIsSidebarVisible(false) // Closes the sidebar when clicking outside
        }}
        className={`${
          isSidebarVisible ? "plasmo-block" : "plasmo-hidden"
        } plasmo-flex-1 plasmo-fixed plasmo-right-0 plasmo-top-0 plasmo-bg-black plasmo-bg-opacity-70 plasmo-w-screen plasmo-h-screen plasmo-z-[9999]`}
      />

      <div
        className={`${
          isSidebarVisible ? "plasmo-right-0" : "-plasmo-right-[999]"
        } plasmo-fixed plasmo-top-0 plasmo-bg-[#1A1A1A] plasmo-w-96 plasmo-h-screen plasmo-z-[10000] plasmo-transition-all flex flex-col`}>
        <div className="plasmo-flex plasmo-flex-col plasmo-h-screen">
          {/* Chat Header */}
          <div className="plasmo-p-4 plasmo-border-b plasmo-border-[#0F0F0F] plasmo-bg-[#333333]">
            <p>Questbot</p>
          </div>

          {/* Chat Box (fills remaining space dynamically) */}
          <div
            id="algoquest-ai-chatbox"
            ref={chatboxRef}
            className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-p-4 plasmo-bg-[#262626] plasmo-space-y-4">
            {/* Chat content */}
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={index}
                  className="plasmo-flex plasmo-flex-row plasmo-space-x-2 plasmo-relative">
                  {message.role === "user" ? (
                    <img
                      src="https://picsum.photos/200"
                      className="plasmo-absolute plasmo-w-6 plasmo-h-6 plasmo-bg-white plasmo-rounded-full"
                    />
                  ) : (
                    <FaRobot className="plasmo-absolute plasmo-w-6 plasmo-h-6" />
                  )}

                  <div className="response-root plasmo-pl-6 plasmo-w-screen space-y-2">
                    <Remark>{message.content}</Remark>
                  </div>
                </div>
              ))
            ) : (
              <div className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-center plasmo-inset-0 plasmo-h-full">
                <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-pl-4">
                  <FaRobot size={48} />

                  <p className="plasmo-text-xl plasmo-text-white plasmo-text-center">
                    Ask the assistant any coding relation questions you may have
                  </p>

                  <div className="plasmo-grid plasmo-gap-2 plasmo-grid-cols-2 plasmo-mt-4">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "What is the problem statement asking for?"
                        )
                      }
                      className="plasmo-border-[1px] plasmo-border-[#333] plasmo-text-[#ccc] plasmo-text-xs plasmo-p-2 plasmo-rounded-full">
                      What is the problem statement asking for?
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage("What is this solution doing?")
                      }
                      className="plasmo-border-[1px] plasmo-border-[#333] plasmo-text-[#ccc] plasmo-text-xs plasmo-p-2 plasmo-rounded-full">
                      What is this solution doing?
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          "What companies have asked this question?"
                        )
                      }
                      className="plasmo-border-[1px] plasmo-border-[#333] plasmo-text-[#ccc] plasmo-text-xs plasmo-p-2 plasmo-rounded-full">
                      What companies have asked this question?
                    </button>

                    <button
                      onClick={() =>
                        handleSendMessage(
                          "What is the time complexity of my solution?"
                        )
                      }
                      className="plasmo-border-[1px] plasmo-border-[#333] plasmo-text-[#ccc] plasmo-text-xs plasmo-p-2 plasmo-rounded-full">
                      What is the time complexity of my solution?
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Show a loading while response is fetched */}
            {isFetchingResponse && (
              <div className="plasmo-flex plasmo-flex-row plasmo-space-x-2 plasmo-relative">
                <FaRobot className="plasmo-absolute plasmo-w-6 plasmo-h-6" />

                <ReactTyped
                  className="plasmo-pl-6"
                  strings={[
                    "Beep...Boop...",
                    "P-R-O-C-E-S-S-I-N-G...Bzzzzt...Bzzzzt...",
                    "Boopity boop...Beepity beep...",
                    "System online...Boop...Boop..."
                  ]}
                  typeSpeed={20}
                  loop
                />
              </div>
            )}
          </div>

          {/* Chat Textbox */}
          <form
            className="plasmo-p-4 plasmo-bg-[#333333] plasmo-border-t plasmo-border-[#0F0F0F]"
            onSubmit={(e) => e.preventDefault()} // Prevent form submission on Enter
          >
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="plasmo-w-full plasmo-p-2 plasmo-bg-[#3C3C3C] plasmo-text-white plasmo-rounded-md"
              placeholder="Ask a follow-up question..."
              onKeyDown={(e) => handleKeyDown(e)}
              style={{ resize: "none", overflow: "hidden", minHeight: "40px" }} // Disable resizing
              rows={1} // Start with 1 line
              onInput={(e) => handleInput(e)} // Dynamically adjust the height
            />

            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mt-2">
              <div className="plasmo-flex plasmo-flex-row space-x-4 plasmo-items-center">
                <IoWarningOutline
                  className={`${apiKey === "" ? "plasmo-text-red-500 plasmo-block" : "plasmo-hidden"} `}
                />

                <p
                  onClick={() => handleUpdateAPIKey()}
                  className={`${apiKey === "" ? "plasmo-text-red-500" : "plasmo-text-white"} plasmo-text-xs plasmo-select-none plasmo-cursor-pointer`}>
                  Gemini-1.5-Flash
                </p>
              </div>
              <button
                disabled={isFetchingResponse}
                onClick={() => handleSendMessage()}
                className="plasmo-text-white plasmo-hover:text-blue-500">
                <FaRegPaperPlane size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
