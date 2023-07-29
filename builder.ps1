$mode = $args[0]

$buildDir = ".\target\build"
$foldersToCopy = ".\dist", ".\models", ".\templates"
$bin = ".\target\release\capituber.*"


if ($mode -eq "run") {
    Set-Location ".\client"
    npm run build
    Set-Location ..
    cargo run
}
elseif ($mode -eq "build") {
    Set-Location ".\client"
    npm run build
    Set-Location ..
    cargo build --release
    if (Test-Path $buildDir) {
        Remove-Item $buildDir -Recurse
    }
    foreach ($folder in $foldersToCopy) {
        Copy-Item $folder $buildDir -Recurse
    }
    Copy-Item ".\LICENSE" $buildDir
    Copy-Item $bin $buildDir -Recurse
}
else {
    Write-Error "Unknown mode ⟨ $mode ⟩"
}