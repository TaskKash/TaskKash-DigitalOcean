Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Users\ahmed\Downloads\TK_2026\000_TASKKASH_Project_Constitution\TASKKASH_Project_Constitution_v2.6.1_AR_360.docx'
$outPath = 'C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean\constitution_raw.txt'
$zipfile = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zipfile.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = [System.IO.StreamReader]::new($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zipfile.Dispose()
# Strip XML tags, leaving text
$text = $content -replace '<[^>]+>', ' '
$text = $text -replace '\s+', ' '
$text | Out-File $outPath -Encoding utf8
Write-Host "Done. Saved to $outPath"
