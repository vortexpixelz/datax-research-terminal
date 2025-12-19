# Monitoring and Observability

This project is instrumented with [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/) to capture
runtime errors and performance signals across the client, server, and edge runtimes.

## Key Dashboards

The following Sentry dashboards provide a starting point for operational monitoring. Import them into your Sentry project
(or recreate them) to visualize error and performance trends.

### 1. API Reliability Overview
- **Widget 1 – Error Rate by Endpoint:** Line chart grouped by `transaction.op: http.server` and filtered to
  `transaction:*api*`. Surfaces route handlers with elevated error counts.
- **Widget 2 – Response Time Heatmap:** Heatmap of `p75(transaction.duration)` by endpoint and hour of day to spot slowdowns.
- **Widget 3 – Recent Critical Issues:** Table filtered to issue level `error` and tag `errorBoundary:portfolio-holdings`
  or other high-impact components.

### 2. Frontend Stability
- **Widget 1 – React Error Boundaries:** Time series of issue counts grouped by the `errorBoundary` tag to identify fragile UI
  modules (`chat-page`, `market-insights`, etc.).
- **Widget 2 – User Impact:** Big number widget showing the count of unique users affected over the last 24 hours
  (`count_unique(user)` on filtered events).
- **Widget 3 – Session Replays:** List of replay events filtered by `issue.id` so designers can review failures with context.

### 3. Performance Insights
- **Widget 1 – Slow Transactions:** Table of the slowest transactions ordered by `p95(transaction.duration)` with the
  `environment` filter applied (e.g., `production`).
- **Widget 2 – Cold Start Detector:** Area chart tracking `transaction.duration` for the `/api/chat` route against
  the `first_event:1` condition to catch cold-start regressions.
- **Widget 3 – Error Budget:** Single stat showing `1 - (failure_count / total_requests)` for API traffic to monitor SLO drift.

## Alerting Examples

Configure Sentry alert rules to notify the team when:
- The error rate on `/api/chat` exceeds 2% over a 10-minute window.
- Any issue tagged with `errorBoundary:root-layout` regresses to the `critical` state.
- P95 duration for `/api/market/stream` exceeds 5 seconds for five consecutive minutes.

## Local Verification

1. Ensure the following environment variables are set (or use `.env.local`):

   ```env
   SENTRY_DSN=your_server_dsn
   SENTRY_ENVIRONMENT=development
   NEXT_PUBLIC_SENTRY_DSN=your_browser_dsn
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
   ```

2. Run the development server and trigger a test error in any wrapped component (for example, throw inside
   `PortfolioHoldings`).
3. Confirm the event appears inside Sentry with the appropriate `errorBoundary` tag and routing metadata.

For advanced customization, see the `sentry.*.config.ts` files in the repository.
