from __future__ import annotations

import ast
import os
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable


WORKSPACE = Path(__file__).resolve().parents[1]
MERIDIAN_EXTERNAL = Path(r"D:\local\Atlas_Meridian")
DOCS_DIR = WORKSPACE / "docs" / "master_log"

EXCLUDED_DIRS = {
    ".git",
    ".cursor",
    ".idea",
    ".vscode",
    "__pycache__",
    "node_modules",
    "dist",
    "build",
    "bin",
    "obj",
    ".venv",
    "venv",
    "coverage",
    "logs",
    "tmp",
    "temp",
    "internal",
    "int",
    ".astro",
    ".svelte-kit",
    ".next",
    "target",
    "alembic",
}

CODE_EXTENSIONS = {
    ".py",
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".vue",
    ".cs",
    ".axaml",
    ".json",
    ".html",
    ".css",
    ".scss",
    ".csproj",
    ".config",
}

EXCLUDED_FILENAMES = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "npm-shrinkwrap.json",
}

NAME_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
JS_VAR_RE = re.compile(r"\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)")
JS_FUNC_RE = re.compile(r"\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(")
JS_ARROW_RE = re.compile(
    r"\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>"
)
JS_CLASS_RE = re.compile(r"\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b")
JS_METHOD_RE = re.compile(
    r"^[ \t]*([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{", re.MULTILINE
)

CS_CLASS_RE = re.compile(r"\b(?:class|interface|record|struct)\s+([A-Za-z_][A-Za-z0-9_]*)")
CS_METHOD_RE = re.compile(
    r"\b(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?(?:partial\s+)?(?:override\s+)?(?:virtual\s+)?(?:sealed\s+)?[A-Za-z_][A-Za-z0-9_<>\[\],\?\.]*\s+([A-Za-z_][A-Za-z0-9_]*)\s*\("
)
CS_FIELD_RE = re.compile(
    r"\b(?:public|private|protected|internal)\s+(?:static\s+)?(?:readonly\s+)?(?:const\s+)?[A-Za-z_][A-Za-z0-9_<>\[\],\?\.]*\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|;|\{)"
)
CSS_VAR_RE = re.compile(r"--([a-zA-Z0-9_-]+)\s*:")
CSS_KEYFRAME_RE = re.compile(r"@keyframes\s+([a-zA-Z0-9_-]+)")
AXAML_NAME_RE = re.compile(r'\bx:Name="([^"]+)"')
AXAML_HANDLER_RE = re.compile(r'\b(?:Click|Tapped|PointerPressed|PointerMoved|PointerReleased|SelectionChanged|TextChanged)="([^"]+)"')


@dataclass(frozen=True)
class SourceSpec:
    label: str
    path: Path
    recursive: bool = True


@dataclass(frozen=True)
class AppSpec:
    title: str
    output_file: str
    scope: str
    sources: tuple[SourceSpec, ...]


def split_identifier(name: str) -> str:
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name.replace("_", " "))
    words = [w.lower() for w in text.split() if w]
    return " ".join(words) if words else name.lower()


def describe_variable(name: str) -> str:
    lower = name.lower()
    phrase = split_identifier(name)
    if name.isupper() or lower.endswith("_id") or lower.endswith("_url"):
        return f"configuration/identifier value for {phrase}"
    if lower.startswith(("is", "has", "can", "should")):
        return f"boolean state for {phrase}"
    if lower.endswith(("list", "items", "nodes", "links", "frames", "map", "dict")):
        return f"collection used for {phrase}"
    if lower.endswith(("config", "options", "settings")):
        return f"configuration object for {phrase}"
    if lower.endswith(("path", "file", "dir", "directory")):
        return f"filesystem reference for {phrase}"
    return f"state/config value for {phrase}"


def describe_callable(name: str) -> str:
    if "." in name:
        left, right = name.split(".", 1)
        return f"{left} member that handles {split_identifier(right)}"

    lower = name.lower()
    phrase = split_identifier(name)

    def action_match(prefix: str) -> bool:
        if not lower.startswith(prefix):
            return False
        if len(name) <= len(prefix):
            return False
        next_char = name[len(prefix)]
        return next_char.isupper() or next_char == "_" or name.islower()

    if action_match("get"):
        return f"retrieves {phrase[3:].strip() or phrase}"
    if action_match("set"):
        return f"updates {phrase[3:].strip() or phrase}"
    if action_match("create"):
        return f"creates {phrase[6:].strip() or phrase}"
    if action_match("update"):
        return f"updates {phrase[6:].strip() or phrase}"
    if action_match("delete"):
        return f"deletes {phrase[6:].strip() or phrase}"
    if action_match("remove"):
        return f"removes {phrase[6:].strip() or phrase}"
    if action_match("list"):
        return f"lists {phrase[4:].strip() or phrase}"
    if action_match("load"):
        return f"loads {phrase[4:].strip() or phrase}"
    if action_match("save"):
        return f"saves {phrase[4:].strip() or phrase}"
    if action_match("parse"):
        return f"parses {phrase[5:].strip() or phrase}"
    if action_match("serialize"):
        return f"serializes {phrase[9:].strip() or phrase}"
    if action_match("deserialize"):
        return f"deserializes {phrase[11:].strip() or phrase}"
    if action_match("render"):
        return f"renders {phrase[6:].strip() or phrase}"
    return f"handles {phrase}"


def iter_code_files(root: Path) -> Iterable[Path]:
    if not root.exists():
        return

    if root.is_file():
        if root.suffix.lower() in CODE_EXTENSIONS and root.name.lower() not in EXCLUDED_FILENAMES:
            yield root
        return

    for current, dirs, files in os.walk(root):
        current_path = Path(current)
        dirs[:] = [d for d in dirs if d.lower() not in EXCLUDED_DIRS]

        for filename in files:
            if filename.lower() in EXCLUDED_FILENAMES:
                continue
            file_path = current_path / filename
            if file_path.suffix.lower() not in CODE_EXTENSIONS:
                continue
            yield file_path


def safe_read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1", errors="ignore")
    except OSError:
        return ""


def extract_python_symbols(text: str) -> tuple[set[str], set[str]]:
    variables: set[str] = set()
    callables: set[str] = set()

    try:
        module = ast.parse(text)
    except SyntaxError:
        for name in re.findall(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=", text, flags=re.MULTILINE):
            variables.add(name)
        for name in re.findall(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", text, flags=re.MULTILINE):
            callables.add(name)
        return variables, callables

    for node in module.body:
        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = []
            if isinstance(node, ast.Assign):
                targets = node.targets
            else:
                targets = [node.target]
            for target in targets:
                if isinstance(target, ast.Name):
                    variables.add(target.id)

        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            callables.add(node.name)

        if isinstance(node, ast.ClassDef):
            callables.add(node.name)
            for child in node.body:
                if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    callables.add(f"{node.name}.{child.name}")
                if isinstance(child, (ast.Assign, ast.AnnAssign)):
                    targets = child.targets if isinstance(child, ast.Assign) else [child.target]
                    for target in targets:
                        if isinstance(target, ast.Name):
                            variables.add(f"{node.name}.{target.id}")

    return variables, callables


def extract_js_ts_symbols(text: str, is_vue: bool) -> tuple[set[str], set[str]]:
    variables: set[str] = set()
    callables: set[str] = set()

    if is_vue:
        script_parts = re.findall(r"<script[^>]*>(.*?)</script>", text, flags=re.DOTALL | re.IGNORECASE)
        text = "\n".join(script_parts) if script_parts else text

    variables.update(JS_VAR_RE.findall(text))
    callables.update(JS_FUNC_RE.findall(text))
    callables.update(JS_ARROW_RE.findall(text))
    callables.update(JS_CLASS_RE.findall(text))

    for method_name in JS_METHOD_RE.findall(text):
        if method_name not in {"if", "for", "while", "switch", "catch", "function", "return"}:
            callables.add(method_name)

    return variables, callables


def extract_csharp_symbols(text: str) -> tuple[set[str], set[str]]:
    variables: set[str] = set()
    callables: set[str] = set()

    callables.update(CS_CLASS_RE.findall(text))
    callables.update(CS_METHOD_RE.findall(text))

    for field in CS_FIELD_RE.findall(text):
        if field not in callables:
            variables.add(field)

    return variables, callables


def extract_json_symbols(text: str) -> tuple[set[str], set[str]]:
    variables: set[str] = set()
    for key in re.findall(r'"([^"]+)"\s*:', text):
        if NAME_RE.fullmatch(key):
            variables.add(key)
    return variables, set()


def extract_axaml_symbols(text: str) -> tuple[set[str], set[str]]:
    variables = {f"x:Name={name}" for name in AXAML_NAME_RE.findall(text)}
    handlers = {f"handler:{handler}" for handler in AXAML_HANDLER_RE.findall(text)}
    return variables, handlers


def extract_css_symbols(text: str) -> tuple[set[str], set[str]]:
    variables = {f"--{name}" for name in CSS_VAR_RE.findall(text)}
    callables = {f"@keyframes {name}" for name in CSS_KEYFRAME_RE.findall(text)}
    return variables, callables


def extract_symbols(path: Path, text: str) -> tuple[list[str], list[str]]:
    suffix = path.suffix.lower()

    if suffix == ".py":
        variables, callables = extract_python_symbols(text)
    elif suffix in {".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"}:
        variables, callables = extract_js_ts_symbols(text, is_vue=False)
    elif suffix == ".vue":
        variables, callables = extract_js_ts_symbols(text, is_vue=True)
    elif suffix == ".cs":
        variables, callables = extract_csharp_symbols(text)
    elif suffix == ".json":
        variables, callables = extract_json_symbols(text)
    elif suffix in {".axaml", ".xaml"}:
        variables, callables = extract_axaml_symbols(text)
    elif suffix in {".css", ".scss"}:
        variables, callables = extract_css_symbols(text)
    else:
        variables, callables = set(), set()

    variables_list = [f"`{name}`: {describe_variable(name)}" for name in sorted(variables)]
    callables_list = [f"`{name}`: {describe_callable(name)}" for name in sorted(callables)]

    return variables_list, callables_list


def infer_role(path: Path) -> str:
    parts = [p.lower() for p in path.parts]
    name = path.name.lower()
    stem = path.stem

    if name in {"package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"}:
        return "Dependency and script configuration for the module."
    if name in {"vite.config.js", "vite.config.ts"}:
        return "Vite build/runtime configuration."
    if name in {"tailwind.config.js", "tailwind.config.ts"}:
        return "Tailwind design-system and utility configuration."
    if name in {"postcss.config.js", "postcss.config.cjs"}:
        return "PostCSS pipeline configuration."
    if name in {"manifest.json", "app.manifest"}:
        return "Application/extension manifest and permission metadata."
    if name in {"tsconfig.json", "tsconfig.node.json", "jsconfig.json"}:
        return "TypeScript/JavaScript compiler configuration."
    if name in {"index.html"}:
        return "HTML host shell/entry document."
    if name in {"main.js", "main.ts", "main.tsx"}:
        return "Application bootstrap/entrypoint."
    if name in {"app.py"}:
        return "FastAPI service bootstrap and middleware wiring."
    if name in {"program.cs"}:
        return "Desktop application startup entrypoint."
    if name.endswith(".csproj"):
        return "Dotnet project build configuration."
    if "router" in parts or "routes" in parts:
        return "Route mapping and navigation behavior."
    if "api" in parts and "v1" in parts and path.suffix.lower() == ".py":
        return "HTTP API endpoint definitions for this feature area."
    if "schemas" in parts and path.suffix.lower() == ".py":
        return "Request/response schema definitions and validation."
    if "models" in parts and path.suffix.lower() == ".py":
        return "Persistence/data model definitions."
    if "services" in parts and path.suffix.lower() == ".py":
        return "Service-layer business logic and integrations."
    if "workers" in parts and path.suffix.lower() == ".py":
        return "Background task worker logic."
    if path.suffix.lower() == ".vue":
        if "views" in parts:
            return "Vue page-level view for user workflows."
        return "Vue reusable UI component."
    if path.suffix.lower() in {".tsx", ".jsx"}:
        if "pages" in parts:
            return "React route/page component."
        return "React component for reusable UI blocks."
    if path.suffix.lower() == ".cs":
        return f"C# implementation for {split_identifier(stem)}."
    if path.suffix.lower() in {".axaml", ".xaml"}:
        return "Avalonia/XAML UI layout resource."
    if path.suffix.lower() in {".css", ".scss"}:
        return "Styling rules/theme definitions."
    if path.suffix.lower() == ".json":
        return "Structured configuration/data consumed by the app."
    if path.suffix.lower() in {".js", ".ts"}:
        return f"Module implementing {split_identifier(stem)} logic."
    return f"Source/config file for {split_identifier(stem)}."


def md_escape(text: str) -> str:
    return text.replace("|", r"\|").replace("\n", "<br>")


def to_markdown_cell(items: list[str]) -> str:
    if not items:
        return "—"
    return md_escape("<br>".join(items))


def build_rows(source: SourceSpec) -> list[str]:
    rows: list[str] = []
    files = sorted(iter_code_files(source.path), key=lambda p: str(p).lower())

    for path in files:
        text = safe_read(path)
        variables, callables = extract_symbols(path, text)

        try:
            display_path = path.relative_to(source.path).as_posix()
            if display_path == ".":
                display_path = path.name
            display_path = f"{source.path.name}/{display_path}" if source.path.is_dir() else path.name
        except ValueError:
            display_path = path.as_posix()

        role = infer_role(path)
        row = (
            f"| `{md_escape(display_path)}` | {md_escape(role)} | "
            f"{to_markdown_cell(variables)} | {to_markdown_cell(callables)} |"
        )
        rows.append(row)

    return rows


def render_inventory(app: AppSpec) -> str:
    today = date.today().isoformat()
    lines: list[str] = [
        f"# {app.title} — Inventory",
        "",
        f"**Last Updated:** {today}",
        "",
        "## Scope and Exclusions",
        "",
        app.scope,
        "",
        "**Excluded directories/artifacts:** `int`, `internal`, `node_modules`, `dist`, `build`, `.git`, `.cursor`, `__pycache__`, `.venv`, `venv`, `obj`, `bin`, `coverage`, `logs`, `tmp`.",
        "",
    ]

    for source in app.sources:
        if not source.path.exists():
            lines.extend(
                [
                    f"## {source.label}",
                    "",
                    f"> Source not found: `{source.path}`",
                    "",
                ]
            )
            continue

        lines.extend(
            [
                f"## {source.label}",
                "",
                f"Source path: `{source.path}`",
                "",
                "| File | Role in application | Key variables/constants | Key methods/functions/classes |",
                "|------|---------------------|-------------------------|-------------------------------|",
            ]
        )
        rows = build_rows(source)
        lines.extend(rows if rows else ["| — | No qualifying files found in scope. | — | — |"])
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    apps = [
        AppSpec(
            title="Atlas Forge",
            output_file="Forge_Inventory.md",
            scope="Covers `atlasforge/` source and behavior-defining config used by Atlas Forge's UI design laboratory.",
            sources=(SourceSpec(label="Atlas Forge Codebase", path=WORKSPACE / "atlasforge"),),
        ),
        AppSpec(
            title="Atlas Apply",
            output_file="Apply_Inventory.md",
            scope="Covers Atlas Apply backend/frontend and extension surfaces: `atlasops/`, `frontend/`, `extension/`, and `quickpro-extension/`.",
            sources=(
                SourceSpec(label="AtlasOps Backend", path=WORKSPACE / "atlasops"),
                SourceSpec(label="Atlas Apply Frontend", path=WORKSPACE / "frontend"),
                SourceSpec(label="Extension (Legacy)", path=WORKSPACE / "extension"),
                SourceSpec(label="QuickPRO Extension", path=WORKSPACE / "quickpro-extension"),
            ),
        ),
        AppSpec(
            title="Atlas Universalis",
            output_file="Universalis_Inventory.md",
            scope="Covers the main site and dev portal implementation in `frontend-main/`.",
            sources=(SourceSpec(label="Main Site Frontend", path=WORKSPACE / "frontend-main"),),
        ),
        AppSpec(
            title="ElectraCast",
            output_file="Electracast_Inventory.md",
            scope="Covers the ElectraCast frontend (`electracast/`) and ElectraCast-specific backend integration modules in `atlasops/`.",
            sources=(
                SourceSpec(label="ElectraCast Frontend", path=WORKSPACE / "electracast"),
                SourceSpec(label="ElectraCast API", path=WORKSPACE / "atlasops" / "api" / "v1" / "electracast.py"),
                SourceSpec(label="ElectraCast Public API", path=WORKSPACE / "atlasops" / "api" / "v1" / "electracast_public.py"),
                SourceSpec(label="ElectraCast Models", path=WORKSPACE / "atlasops" / "models" / "electracast.py"),
                SourceSpec(label="ElectraCast Schemas", path=WORKSPACE / "atlasops" / "schemas" / "electracast.py"),
                SourceSpec(label="Megaphone Service", path=WORKSPACE / "atlasops" / "services" / "megaphone.py"),
            ),
        ),
        AppSpec(
            title="Atlas Meridian",
            output_file="Meridian_Inventory.md",
            scope="Covers Atlas Meridian primary desktop code from external path `D:\\local\\Atlas_Meridian` with local supplemental modules (`meridian/` + Meridian API/schema files).",
            sources=(
                SourceSpec(label="External Meridian Codebase", path=MERIDIAN_EXTERNAL),
                SourceSpec(label="Local Meridian Prototype", path=WORKSPACE / "meridian"),
                SourceSpec(label="Meridian API", path=WORKSPACE / "atlasops" / "api" / "v1" / "meridian.py"),
                SourceSpec(label="Meridian Schemas", path=WORKSPACE / "atlasops" / "schemas" / "meridian.py"),
            ),
        ),
    ]

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for app in apps:
        output_path = DOCS_DIR / app.output_file
        output_path.write_text(render_inventory(app), encoding="utf-8")
        print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
