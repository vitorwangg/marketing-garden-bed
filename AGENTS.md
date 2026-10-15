# Architecture rules
- Dashboard, Dimineutron, and Intelligence share a workspace wrapper and header that inherit the global visual tokens; keep Content Factory presentation and workflows independent to avoid unrelated regressions.
- Dimineutron reuses the existing CRM page; legacy Concierge, Neutron, and ADS URLs redirect to their consolidated destinations so old links remain usable.
- Traffic-manager conversations live in a route-keyed, memory-only provider and render through AI Elements; responses are explicitly simulated until server-side AI is requested.
- CSV lead segmentation uses Papa Parse and a pure filtering helper; never send uploaded lead data to external services in the frontend prototype.
- Existing Brand DNA persistence depends on the configured external backend and identity model; do not claim database persistence based solely on source configuration.