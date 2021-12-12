import { ActionFunction, json, redirect } from "remix"
import { db } from "~/utils/db.server"
import { createSnapshot } from "~/utils/snapshot.server"

export const action: ActionFunction = async ({ request, params }) => {
    const id = Number(params.id!)
    if (isNaN(id))
        throw new Response("Invalid ID", { status: 400 })

    const form = await request.formData()
    const active = form.get("active") === "true"

    const m = await db.monitor.findFirst({
        where: {
            id,
            email: "kot@yukata.tech" // TODO
        }
    })

    if (m === null)
        throw new Response("Not Found", { status: 404 })

    await db.monitor.update({
        where: {
            id
        },
        data: {
            active
        }
    })

    return redirect(`/monitors/${m.id}`)
}
