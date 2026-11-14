using Cajero.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
namespace Cajero.Data
{
    public class CajeroDbContext : DbContext
    {
        public CajeroDbContext(DbContextOptions<CajeroDbContext> opciones)
            : base(opciones)
        {
        }

        public DbSet<Cliente> Clientes => Set<Cliente>();
        public DbSet<Cuenta> Cuentas => Set<Cuenta>();
        public DbSet<Tarjeta> Tarjetas => Set<Tarjeta>();
        public DbSet<Sesion> Sesiones => Set<Sesion>();
        public DbSet<Operacion> Operaciones => Set<Operacion>();
        public DbSet<CredencialTarjeta> Credenciales => Set<CredencialTarjeta>();
        protected override void OnModelCreating(ModelBuilder modelo)
        {
            base.OnModelCreating(modelo);

            modelo.Entity<Cliente>(entidad =>
            {
                entidad.ToTable("Clientes");
                entidad.HasKey(cliente => cliente.IdCliente);
            });

            modelo.Entity<Cuenta>(entidad =>
            {
                entidad.ToTable("Cuentas");
                entidad.HasKey(cuenta => cuenta.NumeroCuenta);

                entidad.HasIndex(cuenta => cuenta.Cbu)
                    .IsUnique();
            });

            modelo.Entity<Tarjeta>(entidad =>
            {
                entidad.ToTable("Tarjetas");
                entidad.HasKey(tarjeta => tarjeta.Numero);

                entidad.HasOne<Cliente>()
                    .WithMany()
                    .HasForeignKey(tarjeta => tarjeta.IdCliente)
                    .OnDelete(DeleteBehavior.Restrict);

                entidad.HasOne<Cuenta>()
                    .WithMany()
                    .HasForeignKey(tarjeta => tarjeta.NumeroCuenta)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelo.Entity<Sesion>(entidad =>
            {
                entidad.ToTable("Sesiones");
                entidad.HasKey(sesion => sesion.IdSesion);

                entidad.HasOne<Cliente>()
                    .WithMany()
                    .HasForeignKey(sesion => sesion.IdCliente)
                    .OnDelete(DeleteBehavior.Restrict);

                entidad.HasOne<Tarjeta>()
                    .WithMany()
                    .HasForeignKey(sesion => sesion.NumeroTarjeta)
                    .OnDelete(DeleteBehavior.Restrict);

                entidad.HasMany(sesion => sesion.Operaciones)
                    .WithOne(operacion => operacion.Sesion)
                    .HasForeignKey(operacion => operacion.IdSesion)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelo.Entity<CredencialTarjeta>(entidad =>
            {
                entidad.ToTable("Credenciales");
                entidad.HasKey(credencial => credencial.NumeroTarjeta);

                entidad.Property(credencial => credencial.SalPin).IsRequired();
                entidad.Property(credencial => credencial.HashPin).IsRequired();

                entidad.HasOne<Tarjeta>()
                    .WithOne()
                    .HasForeignKey<CredencialTarjeta>(
                        credencial => credencial.NumeroTarjeta)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelo.Entity<Operacion>(entidad =>
            {
                entidad.ToTable("Operaciones");
                entidad.HasKey(operacion => operacion.NumeroOperacion);

                entidad.HasOne(operacion => operacion.Cuenta)
                    .WithMany()
                    .HasForeignKey(operacion => operacion.NumeroCuenta)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                entidad.HasDiscriminator<string>("TipoOperacion")
                    .HasValue<Consulta>("Consulta")
                    .HasValue<Extraccion>("Extraccion")
                    .HasValue<Transferencia>("Transferencia");
            });

            modelo.Entity<Transferencia>()
                .Ignore(transferencia => transferencia.CuentaDestino);

            var centavos = new ValueConverter<decimal, long>(
    importe => ConvertirACentavos(importe),
    valorGuardado => valorGuardado / 100m);

            modelo.Entity<Cuenta>(entidad =>
            {
                entidad.Property(cuenta => cuenta.SaldoTotal).HasConversion(centavos);
                entidad.Property(cuenta => cuenta.SaldoDisponible).HasConversion(centavos);
                entidad.Property(cuenta => cuenta.LimiteDiario).HasConversion(centavos);
            });

            modelo.Entity<Consulta>(entidad =>
            {
                entidad.Property(consulta => consulta.SaldoTotal).HasConversion(centavos);
                entidad.Property(consulta => consulta.SaldoDisponible).HasConversion(centavos);
            });

            modelo.Entity<Extraccion>(entidad =>
            {
                entidad.Property(extraccion => extraccion.Monto).HasConversion(centavos);
                entidad.Property(extraccion => extraccion.SaldoRestante).HasConversion(centavos);
            });

            modelo.Entity<Transferencia>()
                .Property(transferencia => transferencia.Monto)
                .HasConversion(centavos);
        }
        private static long ConvertirACentavos(decimal importe)
        {
            if (decimal.Round(importe, 2) != importe)
            {
                throw new System.ArgumentException(
                    "El importe debe tener como máximo dos decimales.",
                    nameof(importe));
            }

            return decimal.ToInt64(importe * 100m);
        }
    }
}
