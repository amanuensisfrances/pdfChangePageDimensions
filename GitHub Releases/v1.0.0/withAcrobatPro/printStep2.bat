@if (@CodeSection == @Batch) @then

rem This batch script is modified from https://stackoverflow.com/a/17050135/

rem Use %SendKeys% to send keys to the keyboard buffer
set SendKeys=CScript //nologo //E:JScript "%~F0"

rem Start Adobe Acrobat Pro (maximized window) and then open the 'Print' window
start /max Acrobat /p step2.pdf

rem Wait 2 seconds then press 'Enter' to virtually print step2.pdf
ping 1.1.1.1 -n 2 > nul && %SendKeys% "{ENTER}"

goto :EOF

@end

// JScript section

var WshShell = WScript.CreateObject("WScript.Shell");
WshShell.SendKeys(WScript.Arguments(0));