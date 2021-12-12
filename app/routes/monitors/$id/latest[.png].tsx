import { LoaderFunction } from "remix"
import { db } from "~/utils/db.server"

export const loader: LoaderFunction = async ({ params }) => {
    const id = Number(params.id!)
    if (isNaN(id))
        throw new Response("Invalid ID", { status: 400 })

    const m = await db.monitor.findFirst({
        where: {
            id,
            email: "kot@yukata.tech" // TODO
        },
        include: {
            snapshots: true
        }
    })

    if (m?.snapshots === null || m!.snapshots.length <= 0)
        throw new Response("Not Found", { status: 404 })

    let res = new Response(m?.snapshots[0].screenshot)
    res.headers.set("Content-Type", "image/png")
    return res
}
