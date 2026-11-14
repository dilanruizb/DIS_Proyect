using Cajero.Application;
using Cajero.Controller;
using Cajero.Data;
using Cajero.View;

using var contexto = new CajeroDbContextFactory().CreateDbContext(args);
DatosPrueba.Cargar(contexto);

var sucursal = new SucursalDB(contexto);
var central = new CentralDB(contexto);
var repositorioSesiones = new RepositorioSesiones(contexto);

var servicio = new ServicioCajero(central, repositorioSesiones);
var controlador = new CajeroController(servicio, sucursal);

var pantalla = new PantallaCajero(controlador);
pantalla.Ejecutar();

Console.WriteLine();
Console.WriteLine();
Console.Write("Presioná cualquier tecla para cerrar el cajero...");
Console.ReadKey();