#!/usr/bin/env python3
"""Sweep production dependencies against the GitHub Advisory Database.

Why this exists instead of `npm audit --omit=dev`:
`npm audit --omit=dev` is documented to exclude dev dependencies, but in
practice it still reports advisories that are only reachable through dev
packages (a known npm bug). That made the CI `audit` job fail
deterministically on two dev-only HIGH findings (braces@3.0.3,
picomatch@2.3.2) even though neither ships to users.

This script queries the same data source Dependabot uses — the GitHub
Advisory Database — and checks ONLY the packages that end up in the
production tree (`dev: true` entries in package-lock.json are skipped).
It FAILS (exit 1) when any production package is affected by a
high/critical advisory. Withdrawn advisories are ignored.

Usage:
    GITHUB_TOKEN=<token> python3 scripts/advisory-sweep.py
The token is optional but recommended: unauthenticated GitHub API calls
are rate-limited to 60/hour. In CI the built-in GITHUB_TOKEN is used.
Exit code 0 = production tree clean, 1 = findings (or API error).
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

SEVERITIES = ("high", "critical")
API = "https://api.github.com/advisories?ecosystem=npm&per_page=100&affects="


def norm(version):
    """Normalize a version string into a comparable int list."""
    version = re.split(r"[-+]", version, maxsplit=1)[0]
    parts = [int(x) if x.isdigit() else 0 for x in version.split(".")]
    return parts + [0] * (4 - len(parts))


def cmpv(a, b):
    pa, pb = norm(a), norm(b)
    return (pa > pb) - (pa < pb)


def in_range(ver, rng):
    """True if ver matches a GitHub vulnerable_version_range.

    Ranges are comma-separated AND conditions; segments are separated by
    ';' or '||' (either means OR).
    """
    if not rng:
        return False
    for seg in re.split(r"[;|]+", rng):
        seg = seg.strip()
        if not seg:
            continue
        ok = True
        for part in seg.split(","):
            part = part.strip()
            m = re.match(r"([<>=!]+)\s*([\d.]+)", part)
            if not m:
                continue
            op, bound = m.groups()
            c = cmpv(ver, bound)
            if op == "<" and not c < 0:
                ok = False
            if op == "<=" and not c <= 0:
                ok = False
            if op == ">" and not c > 0:
                ok = False
            if op == ">=" and not c >= 0:
                ok = False
            if op == "=" and not c == 0:
                ok = False
            if op == "!=" and not c != 0:
                ok = False
        if ok:
            return True
    return False


def pkg_name(key):
    """Extract the package name from a package-lock 'packages' key."""
    rest = key
    while rest.startswith("node_modules/"):
        rest = rest[len("node_modules/"):]
    # Nested installs: node_modules/a/node_modules/b -> b
    if "/node_modules/" in rest:
        rest = rest.rsplit("/node_modules/", 1)[1]
    parts = rest.split("/")
    if rest.startswith("@") and len(parts) >= 2:
        return "/".join(parts[:2])
    return parts[0]


def fetch_advisories(pkg, token):
    """Return the advisory list for a package, following pagination."""
    items = []
    url = API + urllib.request.quote(pkg, safe="")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    while url:
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.build_opener().open(req, timeout=60) as r:
                items.extend(json.loads(r.read() or b"[]"))
                link = r.headers.get("Link", "")
                m = re.search(r'<([^>]+)>;\s*rel="next"', link)
                url = m.group(1) if m else None
        except urllib.error.HTTPError as e:
            body = e.read()[:500].decode("utf-8", "replace")
            print(f"ERROR: GitHub API {e.code} for {pkg}: {body}", file=sys.stderr)
            raise SystemExit(2)
    return items


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    lock_path = os.path.join(root, "package-lock.json")
    with open(lock_path) as f:
        lock = json.load(f)

    prod = {}
    for key, info in lock.get("packages", {}).items():
        if not key or not info.get("version"):
            continue
        if info.get("dev"):
            continue
        prod.setdefault(pkg_name(key), set()).add(info["version"])

    token = os.environ.get("GITHUB_TOKEN", "")
    print(f"checking {len(prod)} production packages "
          f"({sum(len(v) for v in prod.values())} name@version pairs)",
          flush=True)

    findings = []
    for pkg in sorted(prod):
        for ver in sorted(prod[pkg]):
            for adv in fetch_advisories(pkg, token):
                if adv.get("state") == "withdrawn":
                    continue
                if adv.get("severity") not in SEVERITIES:
                    continue
                for vuln in adv.get("vulnerabilities", []):
                    if in_range(ver, vuln.get("vulnerable_version_range", "")):
                        findings.append(
                            f"{pkg}@{ver}: {adv.get('ghsa_id')} "
                            f"{adv.get('severity')} {adv.get('cve_id') or ''} "
                            f"range={vuln.get('vulnerable_version_range')}"
                        )

    if findings:
        print(f"FAIL: {len(findings)} HIGH/CRITICAL finding(s) in "
              "production dependencies:", flush=True)
        for line in findings:
            print("  " + line, flush=True)
        return 1

    print("OK: no high/critical advisories affect production dependencies",
          flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
