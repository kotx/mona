# yuktec/mona

## Development

From your terminal:

```sh
npx playwright install-deps
npx playwright install
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

### TODOs
- Everything marked with a `TODO` comment (a lot)
- `sfn-scheduler` must be replaced- it is deprecated (https://github.com/hyurl/sfn-scheduler/issues/1)
- Some sort of WebSocket/event socket for informing the client of new snapshots
- Some way to 'diff' snapshots (thru html or the screenshot)

## Deployment

If you've followed the setup instructions already, all you need to do is run this:

```sh
npm run deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.
