'use client'

import { revalidatePath } from "next/cache"

export default function Reload() {
  return (
    <button onClick={() => revalidatePath('/')}>다시 불러와</button>

  )
}
