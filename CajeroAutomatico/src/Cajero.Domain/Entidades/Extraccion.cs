using Cajero.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Entidades
{
    public class Extraccion : Operacion, IExtraccion
    {
        private decimal _monto;
        private decimal _saldoRestante;

        public decimal Monto
        {
            get { return _monto; }
            set { _monto = value; }
        }

        public decimal SaldoRestante
        {
            get { return _saldoRestante; }
            set { _saldoRestante = value; }
        }

        public Extraccion()
        {
        }

        public Extraccion(int idSesion, Cuenta cuenta, DateTime fechaHora, decimal monto)
            : base(idSesion, cuenta.NumeroCuenta, fechaHora)
        {
            Cuenta = cuenta;
            _monto = monto;
        }

        public decimal obtenerSaldoRestante()
        {
            return _saldoRestante;
        }

        public override string obtenerDetalle()
        {
            string detalle = base.obtenerDetalle();
            if (Estado == "Rechazada")
            {
                return detalle;
            }

            return detalle + Environment.NewLine +
                $"  Monto extraído: ${Monto:N2}";
        }

        public bool solicitarAutorizacion()
        {
            return Cuenta != null && Cuenta.validarFondos(_monto);
        }

        public bool dispensarEfectivo(IInteraccionCajero pantalla)
        {
            if (Estado != "Exitosa" || NumeroOperacion == 0)
            {
                return false;
            }

            pantalla.MostrarMensaje($"Retirá ${Monto:N2}.");
            return true;
        }

        public override bool ejecutar()
        {
            Cuenta? cuenta = Cuenta;
            if (cuenta == null || !cuenta.debitar(_monto))
            {
                return false;
            }

            _saldoRestante = cuenta.SaldoDisponible;
            return true;
        }
    }
}
