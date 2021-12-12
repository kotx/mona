import { useState } from "react"
import { MetaFunction, LoaderFunction, useTransition, ActionFunction, redirect, useFormAction, useActionData } from "remix"
import { useLoaderData, json, Link, Form } from "remix"
import { db } from "~/utils/db.server"
import { createSnapshot } from "~/utils/snapshot.server"

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const url = form.get("url")?.toString()
  const name = form.get("name")?.toString() ?? new URL(url!).hostname

  if (url === undefined)
    throw json("Missing URL", { status: 400 })

  const monitor = await db.monitor.create({
    data: {
      email: "kot@yukata.tech", // TODO
      name: name!,
      url,
      active: false
    }
  })

  await createSnapshot(monitor)

  return redirect(`/monitors/${monitor.id}`)
}

export default function Create() {
  const transition = useTransition()

  return (
    <div className="mona__page">
      <main>
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

            <button type="submit">{transition.state === "submitting"
              ? "Creating..."
              : "Create"}
            </button>
          </fieldset>
        </Form>
      </main>
    </div >
  )
}

export const meta: MetaFunction = () => {
  return {
    title: "Create a monitor - Mona",
    description: "Monitor a webpage for changes"
  }
}
