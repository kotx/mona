import { LoaderFunction } from "remix"
import { db } from "~/utils/db.server"

export const loader: LoaderFunction = async ({ params }) => {
    const id = Number(params.id!)
    if (isNaN(id))
        throw new Response("Invalid ID", { status: 400 })

    const s = await db.snapshot.findFirst({
        where: {
            id,
            monitor: {
                email: "kot@yukata.tech" // TODO
            }
        },
        select: {
            screenshot: true
        }
    })

    if (s?.screenshot === null)
        throw new Response("Not Found", { status: 404 })

    let res = new Response(s?.screenshot)
    res.headers.set("Content-Type", "image/png")
    res.headers.set("Cache-Control", "max-age=604800, immutable")
    return res
}
