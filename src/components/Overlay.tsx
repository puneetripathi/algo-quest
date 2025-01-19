import { useState } from "react"

import DialogBox from "./DialogBox"

type Props = {
  showOverlay: boolean
}

export default function Overlay({ showOverlay }: Props) {
  return (
    <div
      className={`${showOverlay ? "plasmo-block" : "plasmo-hidden"} plasmo-fixed plasmo-left-0 plasmo-right-0 plasmo-h-screen plasmo-w-screen plasmo-z-[999] plasmo-backdrop-blur-md`}
    />
  )
}
