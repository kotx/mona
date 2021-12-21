import { Monitor } from "@prisma/client"
import Schedule from "sfn-scheduler"
import { db } from "./db.server"
import { createSnapshot } from "./snapshot.server"

declare global {
    var schedules: { [monitorId: number]: Schedule } | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new schedule with every change either.
if (global.schedules === undefined) {
    global.schedules = {}
    initMonitors()
}

export async function initMonitors() {
    console.debug("initializing monitor schedules")
    let monitors = await db.monitor.findMany()
    for (const monitor of monitors) {
        await setMonitor(monitor)
    }
}

export async function setMonitor(monitorInit: Monitor) {
    if (global.schedules![monitorInit.id] !== undefined) {
        deleteMonitor(monitorInit.id)
    }

    console.debug("creating schedule for monitor " + monitorInit.id + " with interval " + monitorInit.interval)

    // TODO: ensure schedules have a start time upon initialization
    global.schedules![monitorInit.id] = new Schedule(monitorInit.interval, async () => {

        const monitor = await db.monitor.findFirst({
            where: {
                id: monitorInit.id
            }
        }) // `monitorInit` may be stale

        if (monitor !== null && !monitor.broken && monitor.active) {
            console.debug(`taking scheduled snapshot for ${monitorInit.id}`)
            await createSnapshot(monitor)
        } else {
            console.debug(`skipping scheduled snapshot for inactive or broken monitor ${monitorInit.id}`)
        }
    })
}

export async function deleteMonitor(monitorId: number) {
    global.schedules![monitorId]?.stop()
    delete global.schedules![monitorId]
}
