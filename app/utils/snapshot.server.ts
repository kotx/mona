import { Monitor } from "@prisma/client"
import { screenshotPage } from "./browser.server"
import { db } from "./db.server"

export async function createSnapshot(monitor: Monitor) {
    try {
        const scrot = await screenshotPage(monitor.url)

        const snapshot = await db.snapshot.create({
            data: {
                screenshot: scrot,
                source: "TODO",
                url: monitor.url,
                monitorId: monitor.id
            }
        })

        if (monitor.broken) {
            try {
                await db.monitor.update({
                    where: {
                        id: monitor.id
                    },
                    data: {
                        broken: false
                    }
                })
            } catch (err) { throw err }
        }

        return snapshot
    } catch (err) {
        try {
            await db.monitor.update({
                where: {
                    id: monitor.id
                },
                data: {
                    broken: true
                }
            })
        } catch (err) { throw err }

        throw err
    }
}
