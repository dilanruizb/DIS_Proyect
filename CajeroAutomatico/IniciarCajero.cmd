@echo off
setlocal
pushd "%~dp0src\Cajero.View" || exit /b 1

dotnet run --project Cajero.View.csproj --no-launch-profile --verbosity quiet
set "resultadoCajero=%errorlevel%"

popd
echo(
echo Presiona una tecla para cerrar el cajero.
pause >nul
exit /b %resultadoCajero%
