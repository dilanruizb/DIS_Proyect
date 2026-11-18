using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Datos
{
    public class CajeroDbContextFactory
       : IDesignTimeDbContextFactory<CajeroDbContext>
    {
        public CajeroDbContext CreateDbContext(string[] args)
        {
            return CrearContexto(ObtenerCarpetaDatos(Directory.GetCurrentDirectory()));
        }

        public static string ObtenerCarpetaDatos(string directorioInicial)
        {
            DirectoryInfo? carpeta = new DirectoryInfo(directorioInicial);
            while (carpeta != null)
            {
                if (File.Exists(Path.Combine(carpeta.FullName, "Cajero.Presentacion.csproj")))
                {
                    return Path.Combine(carpeta.FullName, "datos");
                }

                string presentacion = Path.Combine(carpeta.FullName, "src", "Cajero.Presentacion");
                if (File.Exists(Path.Combine(presentacion, "Cajero.Presentacion.csproj")))
                {
                    return Path.Combine(presentacion, "datos");
                }

                carpeta = carpeta.Parent;
            }

            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "CajeroAutomatico", "datos");
        }

        public static CajeroDbContext CrearContexto(string carpetaDatos)
        {
            Directory.CreateDirectory(carpetaDatos);

            string rutaBase = Path.Combine(carpetaDatos, "cajero.db");

            var conexion = new SqliteConnectionStringBuilder
            {
                DataSource = rutaBase,
                ForeignKeys = true
            };

            var opciones = new DbContextOptionsBuilder<CajeroDbContext>()
                .UseSqlite(conexion.ToString())
                .Options;

            return new CajeroDbContext(opciones);
        }
    }
}
