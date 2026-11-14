using Cajero.Domain.Entidades;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace Cajero.Data
{
    public static class DatosPrueba
    {
        public static void Cargar(CajeroDbContext contexto)
        {
            DateOnly hoy = DateOnly.FromDateTime(DateTime.Today);

            using var transaccion = contexto.Database.BeginTransaction();

            AgregarTarjeta(
                contexto, "1000000000000001", "1111",
                "Ana", "Pérez", "0001", "0000000000000000000001",
                100_000m, hoy.AddYears(2));

            AgregarTarjeta(
                contexto, "1000000000000002", "2222",
                "Bruno", "Gómez", "0002", "0000000000000000000002",
                0m, hoy.AddYears(2));

            AgregarTarjeta(
                contexto, "1000000000000003", "3333",
                "Carla", "López", "0003", "0000000000000000000003",
                50_000m, hoy.AddYears(-1));

            transaccion.Commit();
        }

        private static void AgregarTarjeta(
            CajeroDbContext contexto,
            string numeroTarjeta,
            string pin,
            string nombre,
            string apellido,
            string numeroCuenta,
            string cbu,
            decimal saldoInicial,
            DateOnly vencimiento)
        {
            if (contexto.Tarjetas.Any(tarjeta => tarjeta.Numero == numeroTarjeta))
            {
                return;
            }

            var cliente = new Cliente
            {
                Nombre = nombre,
                Apellido = apellido
            };

            var cuenta = new Cuenta
            {
                NumeroCuenta = numeroCuenta,
                Cbu = cbu,
                SaldoTotal = saldoInicial,
                SaldoDisponible = saldoInicial,
                LimiteDiario = 20_000m
            };

            contexto.Clientes.Add(cliente);
            contexto.Cuentas.Add(cuenta);
            contexto.SaveChanges();

            contexto.Tarjetas.Add(new Tarjeta
            {
                Numero = numeroTarjeta,
                FechaVencimiento = vencimiento,
                Bloqueada = false,
                EntidadEmisora = "Banco Demo",
                IdCliente = cliente.IdCliente,
                NumeroCuenta = cuenta.NumeroCuenta
            });

            byte[] sal = RandomNumberGenerator.GetBytes(16);

            contexto.Credenciales.Add(new CredencialTarjeta
            {
                NumeroTarjeta = numeroTarjeta,
                SalPin = sal,
                HashPin = Rfc2898DeriveBytes.Pbkdf2(
                    pin, sal, 600_000, HashAlgorithmName.SHA256, 32)
            });

            contexto.SaveChanges();
        }
    }
}
