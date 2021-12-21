import { Monitor, Snapshot } from "@prisma/client"
import { ActionFunction, Form, json, Link, LoaderFunction, MetaFunction, useFormAction, useLoaderData, useSubmit, useTransition } from "remix"
import { db } from "~/utils/db.server"

type MonitorInfo = {
    id: number
    name: string
    url: string
    active: boolean
    broken: boolean
    interval: string
    snapshots: SnapshotInfo[]
}

type SnapshotInfo = {
    id: number
    url: string
    createdAt: Date
}

export const loader: LoaderFunction = async ({ params }) => {
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

    const snapshots = await db.snapshot.findMany({
        where: {
            monitorId: m.id,
        },
        select: {
            id: true,
            url: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return json({
        id: m.id,
        name: m.name,
        url: m.url,
        active: m.active,
        snapshots: snapshots.map((s): SnapshotInfo => {
            return {
                id: s.id,
                url: s.url,
                createdAt: s.createdAt
            }
        })
    })
}

export default function Info() {
    const m: MonitorInfo = useLoaderData()
    const transition = useTransition()

    return (
        <div className="mona__page">
            <div>
                {m.snapshots !== null && m.snapshots.map((s: SnapshotInfo) => {
                    const scrotUrl = `/snapshots/${s.id}.png`

                    return (
                        <div key={s.id} className="mona__card">
                            <h3>{s.createdAt.toLocaleString()}</h3>
                            {s.url !== m.url && <p><i>{s.url}</i></p>}
                            <a href={scrotUrl} target="_blank" >
                                <img className="zoom" width="100%" src={scrotUrl} alt={`Latest screenshot of ${s.url}`} />
                            </a>
                        </div>
                    )
                })}
            </div>
            <aside style={{ height: "100%" }}>
                <h2>{m.name} {m.broken && <em>(broken!)</em>}</h2>

                {m.name !== m.url &&
                    <p><i>{m.url}</i></p>
                }

                <p>{m.interval}</p>

                <div className="button-group">
                    <Form method="post">
                        <fieldset disabled={transition.state === "submitting"}>

                            <button type="submit" formAction={useFormAction("capture")}>
                                Capture
                            </button>

                            <input type="hidden" name="active" value={(!m.active).toString()} />
                            <button type="submit" formAction={useFormAction("active")}>
                                {m.active ? "Deactivate" : "Activate"}
                            </button>

                            <button type="submit" formAction={useFormAction("delete")}>
                                Delete
                            </button>
                        </fieldset>
                        {transition.state === "submitting" && <i>Please wait...</i>}
                    </Form>
                </div>
            </aside >
        </div >
    )
}

export const meta: MetaFunction = () => {
    return {
        title: "Monitors - Mona",
        description: "Monitor a webpage for changes"
    }
}
