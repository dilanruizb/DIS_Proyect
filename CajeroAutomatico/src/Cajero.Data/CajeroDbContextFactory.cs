using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Data
{
    public class CajeroDbContextFactory
       : IDesignTimeDbContextFactory<CajeroDbContext>
    {
        public CajeroDbContext CreateDbContext(string[] args)
        {
            string carpetaDatos = Path.Combine(
                Directory.GetCurrentDirectory(), "datos");

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
