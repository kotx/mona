import { Monitor } from "@prisma/client"
import { screenshotPage } from "./browser.server"
import { db } from "./db.server"

export async function createSnapshot(monitor: Monitor) {
    try {
        const scrot = await screenshotPage(monitor.url)

        return await db.snapshot.create({
            data: {
                screenshot: scrot,
                source: "TODO",
                url: monitor.url,
                monitorId: monitor.id
            }
        })
    } catch (e) {
        await db.monitor.update({
            where: {
                id: monitor.id
            },
            data: {
                broken: true
            }
        })

        throw e
    }
}
