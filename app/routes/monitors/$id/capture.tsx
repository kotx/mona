import { ActionFunction, json, redirect } from "remix"
import { db } from "~/utils/db.server"
import { createSnapshot } from "~/utils/snapshot.server"

export const action: ActionFunction = async ({ request, params }) => {
    const id = Number(params.id!)
    if (isNaN(id))
        throw new Response("Invalid ID", { status: 400 })

    const m = await db.monitor.findFirst({
        where: {
            id,
            email: "kot@yukata.tech" // TODO
        }
    })

    if (m === null)
        throw new Response("Not Found", { status: 404 })

    await createSnapshot(m)
    return redirect(`/monitors/${m.id}`)
}
