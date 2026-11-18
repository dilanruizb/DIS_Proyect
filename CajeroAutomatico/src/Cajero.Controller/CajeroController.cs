using Cajero.Application;
using Cajero.Domain.Entidades;
using Cajero.Domain.Enums;
using System;
using System.Collections.Generic;
using Cajero.Domain.Interfaces;
using Cajero.Domain.Resultados;

namespace Cajero.Controller
{
    public class CajeroController
    {
        private readonly ServicioCajero _servicio;
        private readonly ISucursalDB _sucursal;

        public CajeroController(ServicioCajero servicio, ISucursalDB sucursal)
        {
            _servicio = servicio;
            _sucursal = sucursal;
        }

        public ResultadoSesion IngresarTarjeta(string numero)
        {
            Sesion sesion = _servicio.IniciarSesion();

            sesion.Estado = EstadoSesion.Autenticando;
            var resultado = _sucursal.validarTarjeta(numero);

            if (resultado.Estado == EstadoValidacionTarjeta.Valida &&
                resultado.Tarjeta != null)
            {
                _servicio.VincularTarjeta(sesion, resultado.Tarjeta);
            }
            else
            {
                sesion.Estado = EstadoSesion.Cerrando;
            }

            return new ResultadoSesion
            {
                Estado = resultado.Estado,
                Sesion = sesion
            };
        }

        public bool IngresarPIN(Sesion sesion, string pin)
        {
            return _servicio.ValidarPIN(sesion, pin);
        }

        public void CompletarCierre(Sesion sesion)
        {
            _servicio.CompletarCierre(sesion);
        }
        public Consulta? ConsultarSaldo(Sesion sesion)
        {
            return _servicio.ConsultarSaldo(sesion);
        }

        public void SolicitarCierre(Sesion sesion)
        {
            _servicio.SolicitarCierre(sesion);
        }
        public ResultadoExtraccion Extraer(Sesion sesion, decimal monto)
        {
            return _servicio.Extraer(sesion, monto);
        }
        public string Transferir(Sesion sesion, string cbuDestino, decimal monto)
        {
            return _servicio.Transferir(sesion, cbuDestino, monto);
        }
        public List<Operacion> ObtenerOperaciones(Sesion sesion)
        {
            return _servicio.ObtenerOperaciones(sesion);
        }
    }
}
