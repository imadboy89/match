Write-Output "export default '$((Get-Date).tostring('yyyy-MM-dd hh:mm:ss'))';" | out-file "D:\backup\React\new\Libs\updated.js" -encoding utf8

#Write-Output '{"last_updated":"' "$((Get-Date).tostring('yyyy-MM-dd hh:mm:ss'))" '"}' -NoNewLine > D:\backup\React\new\web\updates.json
#Write-Output "var last_updated = '$((Get-Date).tostring('yyyy-MM-dd hh:mm:ss'))';"  > D:\backup\React\new\web\updates.json