using Cajero.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using Cajero.Domain.Interfaces;
using Cajero.Domain.Resultados;

namespace Cajero.Data
{
    public class CentralDB : ICentralDB
    {
        private readonly CajeroDbContext _contexto;

        public CentralDB(CajeroDbContext contexto)
        {
            _contexto = contexto;
        }

        public bool validarPIN(string numeroTarjeta, string pin)
        {
            var credencial = _contexto.Credenciales
                .AsNoTracking()
                .SingleOrDefault(c => c.NumeroTarjeta == numeroTarjeta);

            if (credencial == null)
            {
                return false;
            }

            byte[] hashIngresado = Rfc2898DeriveBytes.Pbkdf2(
                pin,
                credencial.SalPin,
                600_000,
                HashAlgorithmName.SHA256,
                32);

            return CryptographicOperations.FixedTimeEquals(
                hashIngresado, credencial.HashPin);
        }
        public Cuenta? consultarCuentaPorTarjeta(string numeroTarjeta)
        {
            Tarjeta? tarjeta = _contexto.Tarjetas.AsNoTracking().SingleOrDefault(t => t.Numero == numeroTarjeta);
            if (tarjeta == null)
            {
                return null;
            }

            return _contexto.Cuentas.AsNoTracking().SingleOrDefault(c => c.NumeroCuenta == tarjeta.NumeroCuenta);
        }
        public ResultadoExtraccion debitar(Sesion sesion, decimal monto)
        {
            if (monto <= 0 || decimal.Round(monto, 2) != monto)
            {
                return new ResultadoExtraccion { Mensaje = "Ingresá un monto positivo con hasta dos decimales." };
            }

            using var transaccion = _contexto.Database.BeginTransaction();

            Tarjeta? tarjeta = _contexto.Tarjetas.Find(sesion.NumeroTarjeta);
            if (tarjeta == null)
            {
                return new ResultadoExtraccion { Mensaje = "No se encontró la tarjeta." };
            }

            Cuenta? cuenta = _contexto.Cuentas.Find(tarjeta.NumeroCuenta);

            if (cuenta == null)
            {
                return new ResultadoExtraccion { Mensaje = "No se encontró la cuenta de la tarjeta." };
            }

            DateTime ahora = DateTime.Now;
            decimal totalExtraido = CalcularDebitosDelDia(cuenta.NumeroCuenta, ahora);

            var extraccion = new Extraccion(sesion.IdSesion, cuenta, ahora, monto);
            extraccion.Sesion = sesion;

            if (monto > cuenta.LimiteDiario - totalExtraido)
            {
                GuardarRechazo(extraccion);
                transaccion.Commit();
                return new ResultadoExtraccion { Mensaje = "La extracción supera el límite diario disponible." };
            }

            if (!extraccion.solicitarAutorizacion() || !extraccion.ejecutar())
            {
                GuardarRechazo(extraccion);
                transaccion.Commit();
                return new ResultadoExtraccion { Mensaje = "Saldo insuficiente." };
            }

            extraccion.Estado = "Exitosa";
            extraccion.registrar();
            _contexto.SaveChanges();
            transaccion.Commit();

            return new ResultadoExtraccion { Operacion = extraccion, Mensaje = "Extracción realizada." };
        }
        private void GuardarRechazo(Operacion operacion)
        {
            operacion.Estado = "Rechazada";
            operacion.registrar();
            _contexto.SaveChanges();
        }

        private decimal CalcularDebitosDelDia(string numeroCuenta, DateTime fecha)
        {
            DateTime inicio = fecha.Date;
            DateTime fin = inicio.AddDays(1);

            var operaciones = _contexto.Operaciones
                .Where(operacion =>
                    operacion.NumeroCuenta == numeroCuenta &&
                    operacion.Estado == "Exitosa" &&
                    operacion.FechaHora >= inicio &&
                    operacion.FechaHora < fin)
                .ToList();

            decimal total = 0;

            foreach (Operacion operacion in operaciones)
            {
                Extraccion? extraccion = operacion as Extraccion;
                if (extraccion != null)
                {
                    total += extraccion.Monto;
                }

                Transferencia? transferencia = operacion as Transferencia;
                if (transferencia != null)
                {
                    total += transferencia.Monto;
                }
            }

            return total;
        }
        public string transferir(Sesion sesion, string cbuDestino, decimal monto)
        {
            if (monto <= 0 || decimal.Round(monto, 2) != monto)
            {
                return "Ingresá un monto positivo con hasta dos decimales.";
            }

            cbuDestino = cbuDestino.Trim();

            using var transaccion = _contexto.Database.BeginTransaction();

            Tarjeta? tarjeta = _contexto.Tarjetas.Find(sesion.NumeroTarjeta);
            if (tarjeta == null)
            {
                return "No se encontró la tarjeta.";
            }

            Cuenta? origen = _contexto.Cuentas.Find(tarjeta.NumeroCuenta);
            if (origen == null)
            {
                return "No se encontró la cuenta de origen.";
            }

            Cuenta? destino = _contexto.Cuentas
                .SingleOrDefault(cuenta => cuenta.Cbu == cbuDestino);

            DateTime ahora = DateTime.Now;
            var transferencia = new Transferencia
            {
                IdSesion = sesion.IdSesion,
                Sesion = sesion,
                NumeroCuenta = origen.NumeroCuenta,
                Cuenta = origen,
                CuentaDestino = destino,
                CbuDestino = cbuDestino,
                FechaHora = ahora,
                Monto = monto
            };

            string? rechazo = null;

            if (destino == null)
            {
                rechazo = "No se encontró una cuenta con ese CBU.";
            }
            else if (origen.NumeroCuenta == destino.NumeroCuenta)
            {
                rechazo = "La cuenta de destino debe ser distinta de la de origen.";
            }
            else if (monto > origen.LimiteDiario - CalcularDebitosDelDia(origen.NumeroCuenta, ahora))
            {
                rechazo = "La transferencia supera el límite diario disponible.";
            }
            else if (!transferencia.ejecutar())
            {
                rechazo = "Saldo insuficiente para transferir.";
            }

            if (rechazo != null)
            {
                GuardarRechazo(transferencia);
                transaccion.Commit();
                return rechazo;
            }

            transferencia.Estado = "Exitosa";
            transferencia.registrar();
            _contexto.SaveChanges();
            transaccion.Commit();

            return $"Transferencia realizada. Comprobante: {transferencia.NumeroComprobante}" +
                Environment.NewLine +
                $"Saldo disponible restante: ${origen.SaldoDisponible:N2}.";
        }
    }
}
