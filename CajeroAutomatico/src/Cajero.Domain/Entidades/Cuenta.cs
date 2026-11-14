using Cajero.Domain.Interfaces;

namespace Cajero.Domain.Entidades
{
    public class Cuenta : ICuenta
    {
        private string _numeroCuenta = string.Empty;
        private string _cbu = string.Empty;
        private decimal _saldoTotal;
        private decimal _saldoDisponible;
        private decimal _limiteDiario;

        public string NumeroCuenta
        {
            get { return _numeroCuenta; }
            set { _numeroCuenta = value; }
        }

        public string Cbu
        {
            get { return _cbu; }
            set { _cbu = value; }
        }

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

        public decimal LimiteDiario
        {
            get { return _limiteDiario; }
            set { _limiteDiario = value; }
        }

        public decimal consultarSaldo()
        {
            return _saldoDisponible;
        }

        public bool validarFondos(decimal monto)
        {
            return monto > 0 && decimal.Round(monto, 2) == monto &&
                monto <= _saldoDisponible && monto <= _saldoTotal;
        }

        public bool debitar(decimal monto)
        {
            if (!validarFondos(monto))
            {
                return false;
            }

            _saldoTotal -= monto;
            _saldoDisponible -= monto;
            return true;
        }

        public void acreditar(decimal monto)
        {
            if (monto <= 0 || decimal.Round(monto, 2) != monto)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(monto), "El monto debe ser positivo y tener hasta dos decimales.");
            }

            decimal total = _saldoTotal + monto;
            decimal disponible = _saldoDisponible + monto;
            _saldoTotal = total;
            _saldoDisponible = disponible;
        }

        public bool transferir(Cuenta destino, decimal monto)
        {
            if (NumeroCuenta == destino.NumeroCuenta || !validarFondos(monto))
            {
                return false;
            }

            destino.acreditar(monto);
            _saldoTotal -= monto;
            _saldoDisponible -= monto;
            return true;
        }

        public Cuenta()
        {
        }

        public Cuenta(string numeroCuenta, string cbu,
            decimal saldoInicial, decimal limiteDiario)
        {
            _numeroCuenta = numeroCuenta;
            _cbu = cbu;
            _saldoTotal = saldoInicial;
            _saldoDisponible = saldoInicial;
            _limiteDiario = limiteDiario;
        }
    }
}
