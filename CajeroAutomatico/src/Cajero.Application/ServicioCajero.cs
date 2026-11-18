using Cajero.Domain.Entidades;
using Cajero.Domain.Enums;
using System;
using System.Collections.Generic;
using Cajero.Domain.Interfaces;
using Cajero.Domain.Resultados;

namespace Cajero.Application
{
    public class ServicioCajero
    {
        private readonly ICentralDB _central;
        private readonly IRepositorioSesiones _sesiones;

        public ServicioCajero(ICentralDB central, IRepositorioSesiones sesiones)
        {
            _central = central;
            _sesiones = sesiones;
        }

        public Sesion IniciarSesion()
        {
            var sesion = new Sesion();
            sesion.iniciar();
            return sesion;
        }

        public void VincularTarjeta(Sesion sesion, Tarjeta tarjeta)
        {
            sesion.IdCliente = tarjeta.IdCliente;
            sesion.NumeroTarjeta = tarjeta.Numero;
            sesion.Estado = EstadoSesion.Validando;

            _sesiones.Guardar(sesion);
        }

        public bool ValidarPIN(Sesion sesion, string pin)
        {
            if (sesion.Estado != EstadoSesion.Validando)
            {
                return false;
            }

            if (_central.validarPIN(sesion.NumeroTarjeta, pin))
            {
                sesion.autenticar();
                _sesiones.Guardar(sesion);
                return true;
            }

            sesion.registrarIntentoFallido();

            _sesiones.Guardar(sesion);
            return false;
        }

        public void CompletarCierre(Sesion sesion)
        {
            if (sesion.Estado != EstadoSesion.Cerrando)
            {
                return;
            }

            sesion.cerrar();
            if (sesion.IdSesion != 0)
            {
                _sesiones.Guardar(sesion);
            }
        }
        public Consulta? ConsultarSaldo(Sesion sesion)
        {
            if (!sesion.estaAutenticada() || sesion.Estado != EstadoSesion.Operando)
            {
                return null;
            }

            var cuenta = _central.consultarCuentaPorTarjeta(sesion.NumeroTarjeta);
            if (cuenta == null)
            {
                return null;
            }

            var consulta = new Consulta(sesion.IdSesion, cuenta, DateTime.Now);

            if (!consulta.ejecutar())
            {
                return null;
            }

            consulta.Estado = "Exitosa";
            consulta.Cuenta = null;

            consulta.Sesion = sesion;
            consulta.registrar();
            _sesiones.Guardar(sesion);

            return consulta;
        }

        public void SolicitarCierre(Sesion sesion)
        {
            if (sesion.Estado == EstadoSesion.Operando ||
                sesion.Estado == EstadoSesion.Validando)
            {
                sesion.Estado = EstadoSesion.Cerrando;
            }
        }
        public ResultadoExtraccion Extraer(Sesion sesion, decimal monto)
        {
            if (!sesion.estaAutenticada() ||
                sesion.Estado != EstadoSesion.Operando ||
                sesion.IdSesion == 0)
            {
                return new ResultadoExtraccion { Mensaje = "Necesitás una sesión autenticada para extraer." };
            }

            return _central.debitar(sesion, monto);
        }
        public string Transferir(Sesion sesion, string cbuDestino, decimal monto)
        {
            if (!sesion.estaAutenticada() ||
                sesion.Estado != EstadoSesion.Operando ||
                sesion.IdSesion == 0)
            {
                return "Necesitás una sesión autenticada para transferir.";
            }

            return _central.transferir(sesion, cbuDestino, monto);
        }
        public List<Operacion> ObtenerOperaciones(Sesion sesion)
        {
            return _sesiones.ObtenerOperaciones(sesion.IdSesion);
        }
    }
}
