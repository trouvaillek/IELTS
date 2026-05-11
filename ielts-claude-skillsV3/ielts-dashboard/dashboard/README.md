# IELTS Dashboard for Codex

This dashboard reads IELTS study data from `~/.ielts/` and visualizes it locally.

After running `install-codex.bat`, start it from the installed Codex skill copy:

```cmd
cd /d "%USERPROFILE%\.codex\skills\ielts-dashboard\dashboard"
npm.cmd install
npm.cmd start
```

Open http://localhost:5173.

On macOS/Linux/Git Bash:

```bash
cd ~/.codex/skills/ielts-dashboard/dashboard
npm install
npm start
```

Useful commands:

```cmd
npm.cmd run seed
npm.cmd run validate
npm.cmd run backup
npm.cmd run reset
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` or CMD.
