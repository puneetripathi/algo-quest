// import { CountButton } from "~features/count-button"

import "~style.css"

function IndexPopup() {
  return (
    <div className="flex items-center justify-center h-16 w-40 bg-red-500">
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
