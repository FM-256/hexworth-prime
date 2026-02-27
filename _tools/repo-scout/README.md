# Repo Scout

GitHub repository discovery tool for Hexworth Prime. Searches for open-source cybersecurity education, networking, CTF, sysadmin, cloud, programming, and certification repos, then scores and maps them to Hexworth houses.

## Requirements

- Node.js (no external dependencies)
- Optional: `GITHUB_TOKEN` env var for higher rate limits (5000 req/hr vs 10 req/min)

## Usage

```bash
# Run all default search queries
node scout.js search

# Search a custom query
node scout.js search --query "penetration testing labs"

# List all discovered repos
node scout.js list

# Show statistics (by house, license, score, content type)
node scout.js stats
```

## Search Queries (Default)

- cybersecurity education
- networking labs
- CTF challenges
- sysadmin tutorials
- cloud labs
- programming courses
- IT certification prep

## Filters

Repos must meet ALL of these to be included:

| Filter | Criteria |
|--------|----------|
| License | MIT, Apache-2.0, CC-BY-4.0, CC-BY-SA-4.0 |
| Stars | Minimum 5 |
| Activity | Pushed within last 2 years |
| Description | Must have a description |

## Quality Scoring

| Signal | Points |
|--------|--------|
| Stars | +1 per 10 stars |
| Forks | +1 per 5 forks |
| Has wiki | +5 |
| Has topics | +3 |
| Pushed within 6 months | +5 |

## House Mapping

Repos are auto-tagged with Hexworth houses based on topics, name, and description:

| House | Keywords |
|-------|----------|
| shield | security, defense, incident-response, blue-team, DFIR |
| eye | SOC, monitoring, detection, threat-intelligence, OSINT |
| dark-arts | pentesting, offensive, red-team, CTF, exploit |
| web | networking, Cisco, routing, TCP/IP, OWASP |
| cloud | AWS, Azure, GCP, DevOps, Kubernetes, Terraform |
| forge | hardware, CompTIA, A+, Network+, Security+, IoT |
| code | programming, Python, JavaScript, algorithms |
| script | Linux, bash, automation, scripting, sysadmin |
| key | cryptography, encryption, PKI, TLS |
| ai | machine learning, AI, deep learning, NLP |

## Output

Discoveries are stored in `discoveries.json`. Each entry:

```json
{
  "url": "https://github.com/owner/repo",
  "name": "owner/repo",
  "description": "...",
  "license": "MIT",
  "stars": 1500,
  "forks": 300,
  "lastPush": "2026-01-15T...",
  "topics": ["security", "ctf"],
  "score": 42,
  "houses": ["dark-arts", "shield"],
  "contentType": "ctf",
  "evaluated": false
}
```

Content types: `lab`, `ctf`, `course`, `tutorial`, `tool`, `reference`, `certification`, `resource`

## Deduplication

Repos already in `discoveries.json` are skipped on subsequent searches (matched by URL).

## Rate Limiting

- Without `GITHUB_TOKEN`: 10 requests/minute (60 requests/hour)
- With `GITHUB_TOKEN`: 5000 requests/hour
- Built-in 1.2s delay between API calls

```bash
export GITHUB_TOKEN=ghp_your_token_here
node scout.js search
```
