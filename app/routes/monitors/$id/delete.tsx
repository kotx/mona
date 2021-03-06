import { ActionFunction, json, redirect } from "remix"
import { db } from "~/utils/db.server"
import { deleteMonitor as destroyMonitor } from "~/utils/scheduler.server"
import { createSnapshot } from "~/utils/snapshot.server"

export const action: ActionFunction = async ({ request, params }) => {
    const id = Number(params.id!)
    if (isNaN(id))
        throw new Response("Invalid ID", { status: 400 })

    // Destroy all scheduled captures
    await destroyMonitor(id)

    await db.snapshot.deleteMany({
        where: {
            monitor: {
                id,
                email: "kot@yukata.tech" // TODO
            }
        }
    })

    await db.monitor.deleteMany({
        where: {
            id,
            email: "kot@yukata.tech" // TODO
        }
    })

    return redirect("/monitors")
}
