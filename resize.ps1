Add-Type -AssemblyName System.Drawing
 $img = [System.Drawing.Image]::FromFile("C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean\client\public\logos\taskkash.png")
 $bmp192 = New-Object System.Drawing.Bitmap 192, 192
 $g192 = [System.Drawing.Graphics]::FromImage($bmp192)
 $g192.DrawImage($img, 0, 0, 192, 192)
 $bmp192.Save("C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean\client\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
 $bmp512 = New-Object System.Drawing.Bitmap 512, 512
 $g512 = [System.Drawing.Graphics]::FromImage($bmp512)
 $g512.DrawImage($img, 0, 0, 512, 512)
 $bmp512.Save("C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean\client\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
 "Done resizing"
