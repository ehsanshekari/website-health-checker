# Website Monitoring Web App

A small React app to visualize website health from CloudWatch Logs via a Lambda Function URL.

## Configure

- Deploy infra to get the Function URL output `StatusApiUrl`.
- Create a `.env.local` with:

```
VITE_STATUS_API_URL=<paste function url>
```

## Run

```
pnpm -w install
pnpm --filter website-monitoring-webapp dev
```

Build production assets:

```
pnpm --filter website-monitoring-webapp build
```

Then serve with `pnpm --filter website-monitoring-webapp preview`.
