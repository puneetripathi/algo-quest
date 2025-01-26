import Dexie from "dexie"

import { DATABASE_NAME, DATABASE_VERSION } from "~constants/db"

const db = new Dexie(DATABASE_NAME)

db.version(DATABASE_VERSION).stores({
  problems: "++id, name, difficulty, tags, link, best_time"
})

export default db
