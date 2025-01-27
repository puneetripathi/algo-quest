// import { CountButton } from "~features/count-button"

import "~style.css"

function IndexPopup() {
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40 plasmo-bg-red-500">
      {/* <CountButton /> */}
      <a
        target="_blank"
        href="chrome-extension://ldabhphojmofmkcfkhecapkamkgpnmpk/tabs/dashboard.html">
        Goto Dashboard
      </a>
    </div>
  )
}

export default IndexPopup
