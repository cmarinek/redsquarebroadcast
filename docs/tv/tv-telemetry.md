```markdown
# TV Telemetry & Privacy

This project collects minimal, aggregated TV profiling metrics to help improve performance on low-powered devices.

Telemetry details:
- Endpoint: POST /api/metrics/tv-profiling
- Data: fps samples, navigation latency metrics, lightweight memory snapshots (when available)
- PII: No personally-identifiable information is sent by default.
- Sampling: Default sampling is low (configurable); telemetry respects the `analyticsEnabled` flag from build config and the user's opt-out.
- Opt-out: Telemetry will not be sent if analytics are disabled in the build configuration or the user has opted out.

If you need stricter compliance, set analyticsEnabled=false in CI/build config and ensure no client metrics are transmitted.
```
