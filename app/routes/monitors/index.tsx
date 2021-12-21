import { Monitor, Snapshot } from "@prisma/client"
import { ActionFunction, Form, json, Link, MetaFunction, redirect, useLoaderData, useTransition } from "remix"
import { db } from "~/utils/db.server"
import { createSnapshot } from "~/utils/snapshot.server"
import { Schedule } from "sfn-scheduler"
import { setMonitor } from "~/utils/scheduler.server"

type MonitorIndex = {
    id: number
    name: string
    url: string
    interval: string
    active: boolean
    broken: boolean
    latestSnapshot?: number
    updatedAt: Date
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const url = form.get("url")?.toString()
    const name = form.get("name")?.toString() ?? new URL(url!).hostname ?? url!
    const interval = form.get("interval")?.toString()

    if (url === undefined)
        throw json("Missing URL", { status: 400 })

    if (interval === undefined)
        throw json("Missing interval", { status: 400 })

    const monitor = await db.monitor.create({
        data: {
            email: "kot@yukata.tech", // TODO
            name: name!,
            url,
            interval,
            active: false,
        }
    })

    try {
        await createSnapshot(monitor)
        await setMonitor(monitor)
    } catch (err) {
        throw err
    }

    return redirect(`/monitors/${monitor.id}`)
}

export async function loader() {
    const monitors = await db.monitor.findMany({
        where: {
            email: "kot@yukata.tech" // TODO
        },
        include: {
            snapshots: true
        }
    })

    return json(monitors.map(m => {
        return {
            id: m.id,
            name: m.name,
            url: m.url,
            interval: m.interval,
            active: m.active,
            latestSnapshot: m.snapshots.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).at(-1)?.id,
            updatedAt: m.updatedAt
        }
    }))
}

export default function Index() {
    const monitors: MonitorIndex[] = useLoaderData()
    const transition = useTransition()

    return (
        <div className="mona__page">
            <main>
                <h2>Monitors</h2>
                <div style={{
                    display: "flex",
                    flexFlow: "row wrap",
                    width: "100%"
                }}>
                    {monitors.sort((a, b) => (b.latestSnapshot || 0) - (a.latestSnapshot || 0)).map(m => {
                        const dashUrl = `/monitors/${m.id}`

                        return (
                            <div key={m.id} className="mona__card" style={{
                                flex: "0 1 auto",
                                height: "100%",
                                width: "100%",
                                margin: "0.25rem"
                            }}>
                                <h3><a href={`${dashUrl}`} className="solid-link">{m.name}</a> {m.broken && <em>(broken!)</em>}</h3>

                                {m.name !== m.url &&
                                    <p style={{ overflow: "ellipsis" }}><i>{m.url}</i></p>
                                }

                                {m.latestSnapshot !== undefined &&
                                    <a href={`${dashUrl}`}>
                                        <img style={{
                                            objectFit: "cover",
                                            width: "100%",
                                            height: "10vh"
                                        }} src={`/snapshots/${m.latestSnapshot}.png`} alt={`Latest screenshot of ${m.url}`} /></a>
                                }

                                Last updated at {m.updatedAt.toLocaleString()}
                            </div>
                        )
                    })}</div>
            </main>
            <aside style={{ display: "block", marginTop: "3.5rem" }}>
                <Form method="post" className="mona__form">
                    <h2>Create new monitor</h2>

                    <fieldset
                        disabled={transition.state === "submitting"}
                    >
                        <p>
                            <label>URL
                                <input type="url" name="url" placeholder="https://example.com" required />
                            </label>
                        </p>

                        <p>
                            <label>Frequency of captures
                                <input type="text" name="interval" placeholder="every 2 hours" required />
                            </label>
                        </p>

                        <button type="submit">{transition.state === "submitting"
                            ? "Creating..."
                            : "Create"}
                        </button>
                    </fieldset>
                </Form>
            </aside>
        </div>
    )
}

export const meta: MetaFunction = () => {
    return {
        title: "Monitors - Mona",
        description: "Monitor a webpage for changes"
    }
}
