using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Interfaces
{
    public interface ICuenta
    {
        string NumeroCuenta { get; set; }
        string Cbu { get; set; }
        decimal SaldoTotal { get; set; }
        decimal SaldoDisponible { get; set; }
        decimal LimiteDiario { get; set; }
    }
}
