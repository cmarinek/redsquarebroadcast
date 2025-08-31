; Custom NSIS installer script for RedSquare Screens

; Add custom install steps
Section
    ; Create desktop shortcut
    CreateShortCut "$DESKTOP\RedSquare Screens.lnk" "$INSTDIR\RedSquare Screens.exe" "" "$INSTDIR\RedSquare Screens.exe" 0
    
    ; Add to Windows Defender exclusions if possible (optional)
    ExecWait 'powershell.exe -WindowStyle Hidden -Command "try { Add-MpPreference -ExclusionPath \"$INSTDIR\" -ErrorAction SilentlyContinue } catch { }"'
SectionEnd

; Custom uninstall steps
Section "Uninstall"
    ; Remove desktop shortcut
    Delete "$DESKTOP\RedSquare Screens.lnk"
    
    ; Clean up user data (optional - user may want to keep settings)
    ; RMDir /r "$APPDATA\RedSquare Screens"
SectionEnd