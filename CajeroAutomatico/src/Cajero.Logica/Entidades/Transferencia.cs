using Cajero.Logica.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Logica.Entidades
{
    public class Transferencia : Operacion, ITransferencia
    {
        private decimal _monto;
        private string _cbuDestino = string.Empty;
        private string _numeroComprobante = string.Empty;
        private Cuenta? _cuentaDestino;

        public decimal Monto
        {
            get { return _monto; }
            set { _monto = value; }
        }

        public string CbuDestino
        {
            get { return _cbuDestino; }
            set { _cbuDestino = value; }
        }

        public string NumeroComprobante
        {
            get { return _numeroComprobante; }
            set { _numeroComprobante = value; }
        }

        public Cuenta? CuentaDestino
        {
            get { return _cuentaDestino; }
            set { _cuentaDestino = value; }
        }

        public Transferencia()
        {
        }

        public Transferencia(int idSesion, Cuenta origen, Cuenta destino, DateTime fechaHora, decimal monto)
            : base(idSesion, origen.NumeroCuenta, fechaHora)
        {
            Cuenta = origen;
            _cuentaDestino = destino;
            _cbuDestino = destino.Cbu;
            _monto = monto;
        }

        public bool validarDestino()
        {
            return Cuenta != null && _cuentaDestino != null &&
                Cuenta.NumeroCuenta != _cuentaDestino.NumeroCuenta &&
                !string.IsNullOrWhiteSpace(_cbuDestino) && _cuentaDestino.Cbu == _cbuDestino;
        }

        public string generarComprobante()
        {
            if (string.IsNullOrEmpty(_numeroComprobante))
            {
                _numeroComprobante = Guid.NewGuid().ToString("N");
            }

            return _numeroComprobante;
        }

        public override string obtenerDetalle()
        {
            string detalle = base.obtenerDetalle();
            if (Estado == "Rechazada")
            {
                return detalle;
            }

            return detalle + Environment.NewLine +
                $"  Monto transferido: ${Monto:N2}" + Environment.NewLine +
                $"  Comprobante: {NumeroComprobante}";
        }

        public bool realizarTransferencia()
        {
            Cuenta? origen = Cuenta;
            Cuenta? destino = _cuentaDestino;

            if (origen == null || destino == null || !validarDestino())
            {
                return false;
            }

            return origen.transferir(destino, _monto);
        }

        public override bool ejecutar()
        {
            if (!realizarTransferencia())
            {
                return false;
            }

            generarComprobante();
            return true;
        }
    }
}
