import { useState } from "react"
import { MetaFunction, LoaderFunction, useTransition, ActionFunction, redirect, useFormAction, useActionData } from "remix"
import { useLoaderData, json, Link, Form } from "remix"
import { screenshotPage } from "~/browser.server"

type MonitorPreview = {
  src: string
  scrot: string
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const url = form.get("url")?.toString()

  if (url === undefined)
    throw json("Missing URL", { status: 400 })

  const scrot = await screenshotPage(url, parseInt(form.get("delay")?.toString() ?? "0") * 1000)

  return json({
    url,
    scrot: scrot.toString("base64")
  })
}

export default function Index() {
  const transition = useTransition()

  const data: MonitorPreview | undefined = useActionData()
  const url = data?.scrot && `data:image/png;base64,${data.scrot}`

  return (
    <div className="remix__page">
      <main>
        {data ? (
          <a href={url} target="_blank">
            <img src={url} alt={`Preview for ${data.src}`} width="100%" />
          </a>
        ) : "Click the test button to preview a webpage!"}
      </main>
      <aside>
        <h2>Create new monitor</h2>
        <Form method="post">
          <p>
            <label>URL
              <input type="url" name="url" placeholder="https://example.com" required />
            </label>
          </p>
          <p>
            <label>Snapshot delay (seconds)
              <input type="number" name="delay" placeholder="none" min={0} max={60} />
            </label>
          </p>

          <button type="submit">{transition.state === "submitting"
            ? "Testing..."
            : "Test"}
          </button>
        </Form>
      </aside>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return {
    title: "Create a monitor - Mona",
    description: "Monitor a webpage for changes"
  }
}
