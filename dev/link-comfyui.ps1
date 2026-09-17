<#
.SYNOPSIS
    Link the PromptCraft source repo into ComfyUI custom_nodes as a directory
    junction, so edits take effect without copying files.

.DESCRIPTION
    Creates:  <ComfyCustomNodes>\ComfyUI-PromptCraft  ->  <Source>

    After linking:
      * Python nodes   : restart ComfyUI to reload
      * js/ modules    : hard-refresh the browser (Ctrl+F5)
      * src/ Vue code  : run `npm run dev` (vite build --watch) once

    Existing deployment is NOT deleted - it is renamed to *.bak and can be
    restored with -Unlink.

.PARAMETER Source
    Repo root. Defaults to the parent directory of this script.

.PARAMETER ComfyCustomNodes
    ComfyUI custom_nodes directory.

.PARAMETER Unlink
    Remove the junction and restore the .bak directory if present.

.PARAMETER DryRun
    Print what would happen without changing anything.

.EXAMPLE
    pwsh -File .\dev\link-comfyui.ps1 -DryRun
        Preview (PowerShell 7). LocalMachine policy is RemoteSigned, so local
        scripts run without -ExecutionPolicy Bypass.

.EXAMPLE
    pwsh -File .\dev\link-comfyui.ps1
        Create the junction (PowerShell 7).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\dev\link-comfyui.ps1
        Same thing on Windows PowerShell 5.1. This script is pure ASCII and
        avoids 7-only syntax, so both hosts work.

.NOTES
    pwsh   = PowerShell 7.x  (.NET, installed separately)
    powershell = Windows PowerShell 5.1 (.NET Framework, ships with Windows)
    Both are supported here; prefer pwsh.
#>

[CmdletBinding()]
param(
    # $PSScriptRoot is <repo>\dev ; parent is the repo root.
    # Falls back to the known checkout path when invoked in a way that leaves
    # $PSScriptRoot empty (e.g. nested `powershell -File` hosts).
    [string]$Source = $(if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { 'E:\coding\moton-promptcraft' }),
    [string]$ComfyCustomNodes = 'E:\Softwares\ComfyUI\ComfyUI-aki-v3\ComfyUI\custom_nodes',
    [string]$LinkName = 'ComfyUI-PromptCraft',
    [switch]$Unlink,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[!!] $msg" -ForegroundColor Yellow }

$Source = (Resolve-Path $Source).Path
$linkPath = Join-Path $ComfyCustomNodes $LinkName
$backupPath = "$linkPath.bak"

# --- sanity check: source looks like the plugin repo -----------------------
foreach ($required in @('__init__.py', 'js', 'pyproject.toml')) {
    if (-not (Test-Path (Join-Path $Source $required))) {
        throw "Source does not look like the plugin repo (missing '$required'): $Source"
    }
}

# --- sanity check: ComfyUI custom_nodes exists ----------------------------
if (-not (Test-Path $ComfyCustomNodes)) {
    throw "custom_nodes not found: $ComfyCustomNodes`nPass -ComfyCustomNodes <path> explicitly."
}

function Test-IsLink($path) {
    if (-not (Test-Path $path)) { return $false }
    $item = Get-Item $path -Force
    return [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
}

# ============================ UNLINK =====================================
if ($Unlink) {
    Write-Host "Unlink mode" -ForegroundColor Cyan

    if (-not (Test-IsLink $linkPath)) {
        Write-Warn "$linkPath is not a junction - nothing to remove."
    }
    else {
        if ($DryRun) {
            Write-Step "DRY RUN: would remove junction $linkPath"
        }
        else {
            # Remove-Item on a junction removes the link only, NOT the target
            [IO.Directory]::Delete($linkPath, $false)
            Write-Ok "Removed junction: $linkPath"
        }
    }

    if (Test-Path $backupPath) {
        if ($DryRun) {
            Write-Step "DRY RUN: would restore $backupPath -> $linkPath"
        }
        else {
            Move-Item $backupPath $linkPath
            Write-Ok "Restored original directory from backup."
        }
    }

    exit 0
}

# ============================ LINK =======================================
Write-Host "Link mode" -ForegroundColor Cyan
Write-Step "Source : $Source"
Write-Step "Link   : $linkPath"
Write-Step "Backup : $backupPath"

if (Test-IsLink $linkPath) {
    $target = (Get-Item $linkPath -Force).Target
    if ($target -eq $Source) {
        Write-Ok "Already linked correctly. Nothing to do."
        exit 0
    }
    Write-Warn "Existing link points elsewhere: $target"
    if ($DryRun) {
        Write-Step "DRY RUN: would remove and re-create"
        exit 0
    }
    [IO.Directory]::Delete($linkPath, $false)
}

if (Test-Path $linkPath) {
    # real directory (the copied deployment) -> back it up, never delete
    if (Test-Path $backupPath) {
        throw "Both '$linkPath' and '$backupPath' exist. Remove or rename '$backupPath' first."
    }
    if ($DryRun) {
        Write-Step "DRY RUN: would rename existing dir -> $backupPath"
    }
    else {
        Move-Item $linkPath $backupPath
        Write-Ok "Existing deployment backed up to: $backupPath"
    }
}

if ($DryRun) {
    Write-Step "DRY RUN: would create junction -> $Source"
    Write-Host "`nNothing was changed." -ForegroundColor Yellow
    exit 0
}

New-Item -ItemType Junction -Path $linkPath -Target $Source | Out-Null

# verify
if ((Test-Path (Join-Path $linkPath '__init__.py')) -and (Test-Path (Join-Path $linkPath 'js'))) {
    Write-Ok "Junction created and verified."
    Write-Host ""
    Write-Host ""
    Write-Host "READ THIS - two different workflows:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  A) Preview Vue popups WITHOUT ComfyUI (fastest):" -ForegroundColor Yellow
    Write-Host "       npm run playground"
    Write-Host "       open http://localhost:5178/dev/playground/index.html"
    Write-Host "       src/ edits hot-reload. ComfyUI not needed at all."
    Write-Host ""
    Write-Host "  B) See changes INSIDE the ComfyUI canvas:" -ForegroundColor Yellow
    Write-Host "       1. Start ComfyUI (restart if it was already running)"
    Write-Host "       2. Vue (src/): keep 'npm run dev' running - it rebuilds"
    Write-Host "          js/promptcraft-vue.js, which ComfyUI loads"
    Write-Host "       3. js/ native modules: hard-refresh browser (Ctrl+F5)"
    Write-Host "       4. Python: restart ComfyUI"
    Write-Host ""
    Write-Host "  Roll back this link: pwsh -File .\dev\link-comfyui.ps1 -Unlink"
}
else {
    throw "Junction created but content is not reachable. Check permissions."
}
