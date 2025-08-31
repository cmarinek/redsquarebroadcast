; Custom NSIS installer script for RedSquare Screens

; Add custom install steps
!macro customInstall
    ; Create desktop shortcut (handled by electron-builder config)
    ; Add to Windows Defender exclusions if possible (optional)
    ExecWait 'powershell.exe -WindowStyle Hidden -Command "try { Add-MpPreference -ExclusionPath \"$INSTDIR\" -ErrorAction SilentlyContinue } catch { }"'
!macroend

; Custom uninstall steps - use macro instead of section
!macro customUnInstall  
    ; Remove desktop shortcut (handled by electron-builder)
    Delete "$DESKTOP\RedSquare Screens.lnk"
!macroend