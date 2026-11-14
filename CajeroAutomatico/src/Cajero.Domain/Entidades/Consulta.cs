using System;
using Cajero.Domain.Interfaces;

namespace Cajero.Domain.Entidades
{
    public class Consulta : Operacion, IConsulta
    {
        private decimal _saldoTotal;
        private decimal _saldoDisponible;

        public decimal SaldoTotal
        {
            get { return _saldoTotal; }
            set { _saldoTotal = value; }
        }

        public decimal SaldoDisponible
        {
            get { return _saldoDisponible; }
            set { _saldoDisponible = value; }
        }

        public Consulta()
        {
        }

        public Consulta(int idSesion, Cuenta cuenta, DateTime fechaHora)
            : base(idSesion, cuenta.NumeroCuenta, fechaHora)
        {
            Cuenta = cuenta;
        }

        public decimal consultarSaldo()
        {
            if (Cuenta == null)
            {
                throw new InvalidOperationException("La consulta no tiene una cuenta asociada.");
            }

            return Cuenta.consultarSaldo();
        }

        public override string obtenerDetalle()
        {
            string detalle = base.obtenerDetalle();
            if (Estado == "Rechazada")
            {
                return detalle;
            }

            return detalle + Environment.NewLine +
                $"  Saldo consultado: ${SaldoDisponible:N2}";
        }

        public void mostrarSaldo(IInteraccionCajero pantalla)
        {
            pantalla.MostrarMensaje($"Saldo total: ${SaldoTotal:N2}");
            pantalla.MostrarMensaje($"Saldo disponible: ${SaldoDisponible:N2}");
        }

        public override bool ejecutar()
        {
            if (Cuenta == null)
            {
                return false;
            }

            _saldoTotal = Cuenta.SaldoTotal;
            _saldoDisponible = consultarSaldo();
            return true;
        }
    }
}
