import { useState } from "react"

import DialogBox from "./DialogBox"

type Props = {
  showOverlay: boolean
}

export default function Overlay({ showOverlay }: Props) {
  return (
    <div
      className={`${showOverlay ? "block" : "hidden"} fixed left-0 right-0 h-screen w-screen z-[999] backdrop-blur-md`}
    />
  )
}
