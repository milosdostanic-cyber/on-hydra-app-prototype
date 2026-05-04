# Skills pack

## Bundled skill

| Skill | Path |
|-------|------|
| Hydra UI — tokens + existing components | [`hydra-ui-tokens-and-components/SKILL.md`](./hydra-ui-tokens-and-components/SKILL.md) |

## Registering in Cursor

1. Open **Cursor Settings → Rules / Skills** (or your Cursor version’s Skills UI).
2. Add a **project skill** pointing at:

   `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components`

   (the folder that contains `SKILL.md`).

3. Enable the skill when working on Hydra UI screens.

If your Cursor build only supports global skills, copy that folder to your user skills directory and keep it in sync with git, or symlink:

```bash
ln -s "<repo>/Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components" \
  ~/.cursor/skills/hydra-ui-tokens-and-components
```

(Adjust `~/.cursor/skills` to match your install.)
