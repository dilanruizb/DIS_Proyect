using Cajero.Logica;
using Cajero.Datos;
using Microsoft.EntityFrameworkCore;

namespace Cajero.Presentacion
{
    internal static class Program
    {
        private static int Main()
        {
            CajeroDbContext? contexto = null;
            try
            {
                string carpetaDatos = CajeroDbContextFactory.ObtenerCarpetaDatos(AppContext.BaseDirectory);
                contexto = CajeroDbContextFactory.CrearContexto(carpetaDatos);
                contexto.Database.Migrate();
                DatosPrueba.Cargar(contexto);
            }
            catch (Exception error)
            {
                contexto?.Dispose();
                Console.Error.WriteLine($"No se pudo abrir la base del cajero.\n{error.Message}");
                return 1;
            }

            using (contexto)
            {
                var sucursal = new SucursalDB(contexto);
                var central = new CentralDB(contexto);
                var sesiones = new RepositorioSesiones(contexto);


                var servicio = new ServicioCajero(central, sesiones);
                var controlador = new ControladorCajero(servicio, sucursal);

                new PantallaCajero(controlador).Ejecutar();
            }

            if (!Console.IsInputRedirected && !Console.IsOutputRedirected)
            {
                Console.WriteLine();
                Console.Write("Presioná cualquier tecla para cerrar el cajero...");
                Console.ReadKey(intercept: true);
            }

            return 0;
        }

    }
}
